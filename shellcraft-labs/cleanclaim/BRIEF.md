# Cleanclaim — MVP Build Brief

> Hand this file to Claude Code (`claude` CLI) from inside this folder:
> `claude "Read BRIEF.md and CLAUDE.md, then start Phase 0."`

## 1. What we're building

A **coder copilot** for hospital revenue cycle teams. A coder or CDI specialist pastes
(de-identified) clinical documentation and/or a draft code set. The app:

1. **Suggests codes that are supported by the documentation** (ICD-10-CM, ICD-10-PCS, HCPCS Level II),
   each with the exact text that supports it.
2. **Finds missed revenue that was earned.** Examples: documented comorbidities (CC/MCC) that change the
   MS-DRG, and procedures performed but not coded.
3. **Catches denials before submission.** Checks NCCI procedure-to-procedure edits, medically unlikely
   edits (MUEs), modifier problems (-25, -59/X{EPSU}), and missing laterality or specificity.
4. **Drafts CDI queries** to the physician when the documentation is too vague to support a more
   specific code. These queries must be compliant and non-leading.
5. **Shows financial impact** (for example "DRG 292 → 291, +$X at the base rate") for codes that are
   *already supported*. It never shows an "unsupported but pays more" option.

The human makes the final decision every time. The app suggests; it never submits a claim.

### Positioning (non-negotiable)
"Get paid **correctly and completely** for documented care." It is not "maximize payment."
Upcoding, meaning choosing codes for reimbursement rather than for what the documentation supports,
creates False Claims Act exposure. Every feature must pass this test: *would this suggestion
survive an OIG/RAC audit with the cited chart text?*

## 2. Users & core flows

| User | Flow |
|---|---|
| Inpatient coder | Paste discharge summary + draft codes → see missing dx, CC/MCC capture, DRG before/after, edit conflicts |
| Outpatient/ED coder | Paste procedure/visit note + draft codes → see HCPCS/modifier checks, NCCI/MUE conflicts |
| CDI specialist | See "documentation gaps" list → generate a query → copy to EHR |
| Anyone | Search the code database by keyword, code, or plain-English description |

## 3. Scope

### In MVP
- Local code database loaded from **free CMS/CDC sources** (see §5)
- Fast code search (full-text + code prefix), with hierarchy, includes/excludes notes, and CC/MCC flags
- An "Analyze" screen: documentation + draft codes in, structured findings out
- NCCI PTP + MUE checks run as **deterministic rules**, not by the LLM
- MS-DRG impact estimate (start with a simplified grouper over a subset of MDCs, clearly labeled as an estimate)
- CDI query drafts
- An audit log of every analysis: inputs hash, findings, model, and the user's accept/reject on each finding
- A synthetic test-case library (fake charts) with expected codes, used as an eval set

### Out of MVP (explicitly)
- **CPT codes.** CPT is AMA-licensed. Design the schema so CPT can be dropped in later, but ship
  without CPT descriptors. (CPT *numbers* typed in by a user can be stored as opaque strings.)
- Real PHI, EHR integration, 837 claim generation, payer contract modeling, 835 remit ingestion
- Multi-tenant auth/SSO (a single local user is fine)

## 4. Architecture

**Stack (TypeScript end to end):**
- `apps/web`: Vite + React + TypeScript + Tailwind
- `apps/api`: Node + Fastify + TypeScript
- `packages/db`: SQLite (better-sqlite3) with **FTS5** for search, Drizzle ORM, migrations.
  Keep the SQL Postgres-compatible enough that we can move later.
- `packages/rules`: pure, deterministic TS functions (NCCI, MUE, modifier, and specificity checks) with unit tests
- `packages/ingest`: scripts that download/parse CMS files into the DB, idempotently and with versions
- `packages/ai`: the Claude integration (see §6)
- `evals/`: synthetic cases + a runner that scores the AI against expected codes
- Package manager: pnpm workspaces. Tests: Vitest. Lint: ESLint + Prettier.

**Key principle: rules are deterministic, the LLM does language.**
The LLM reads documentation, proposes candidate codes with citations, and drafts queries.
Code validity, edit conflicts, CC/MCC status, and DRG math always come from the database and the rules engine.
Every LLM-proposed code must be **validated against the DB** (exists, is billable/valid for the date of service,
and is not a header code) before it is shown. Codes that fail are dropped and logged.

### Analysis pipeline
```
input (note + draft codes + setting + DOS)
  → retrieve: candidate codes via FTS over the note's key terms (top-N per concept)
  → LLM pass: extract diagnoses/procedures with supporting quotes, choose codes ONLY from the
              retrieved candidates (or explicitly request another search via a tool)
  → validate: every code exists/valid for DOS; quotes must be verbatim substrings of the input
  → rules: NCCI PTP, MUE, modifiers, excludes1 conflicts, specificity/laterality
  → DRG: before/after estimate (inpatient only)
  → findings[] → UI (accept / reject / edit each) → audit log
```

## 5. Data sources (all free; record source URL, release/version, and effective dates per row set)

| Dataset | Source | Notes |
|---|---|---|
| ICD-10-CM codes + tabular (includes/excludes, notes) | CMS / CDC NCHS annual release (XML) | FY-based, effective Oct 1. Use the XML tabular, not just the flat code list |
| ICD-10-PCS codes + tables | CMS annual release | |
| HCPCS Level II | CMS quarterly alpha-numeric file | Track the quarter |
| NCCI PTP edits (practitioner + hospital outpatient) | CMS NCCI quarterly files | Large; index carefully |
| MUEs | CMS NCCI MUE files | |
| MS-DRG definitions, CC/MCC lists, CC exclusions, relative weights | CMS IPPS final rule tables / MS-DRG definitions manual | Weights × a configurable hospital base rate = estimate |

Claude: find the current official download pages on cms.gov / cdc.gov yourself. **Do not invent URLs.**
Put each URL in `packages/ingest/sources.ts` with a comment saying when it was verified. Downloads go to
a git-ignored `data/raw/`, and parsed output goes to the SQLite DB.

### Core tables (starting point; refine as needed)
- `code_sets(id, system, version, effective_from, effective_to, source_url, loaded_at)`
- `codes(system, code, short_desc, long_desc, is_billable, parent_code, code_set_id, ...)`, plus an FTS5 virtual table
- `code_notes(system, code, note_type[includes|excludes1|excludes2|code_first|use_additional|code_also], text)`
- `cc_mcc(code, level[CC|MCC], code_set_id)`, `cc_exclusions(pdx_code, sdx_code)`
- `drgs(drg, mdc, title, weight, gmlos, alos, code_set_id)`
- `ncci_ptp(col1, col2, modifier_indicator, effective, deleted, setting)`
- `mue(code, value, adjudication_indicator, setting)`
- `analyses(id, created_at, input_hash, setting, dos, model, findings_json)`, `finding_decisions(analysis_id, finding_id, decision, edited_code, user_note)`

## 6. Claude integration (`packages/ai`)

- SDK: `@anthropic-ai/sdk`. Model: `claude-opus-5-5`. Credentials come from the environment
  (`ANTHROPIC_API_KEY` or an `ant auth login` profile). Never hardcode them.
- **Structured outputs** (`output_config.format` with a JSON schema) for the findings payload. No prefill.
- Opus 5.5: thinking is always on. Don't send `thinking: {type:"disabled"}` or `budget_tokens` (both 400).
  Set `output_config.effort` explicitly (`high` for analysis, `low` for simple search reranking).
- Don't use forced `tool_choice` (`any`/`tool` returns 400 on this model). Use `auto` + `strict: true` tools,
  or structured outputs.
- Handle `stop_reason === "refusal"`. Enable server-side fallbacks
  (`betas: ["server-side-fallback-2026-07-01"]`, `fallbacks: "default"` on `client.beta.messages`).
- Stream long analyses and use `.finalMessage()`.
- Prompt caching: put the static system prompt + coding guideline excerpts first with `cache_control`, and
  the per-request note last.
- Tool available to the model: `search_codes(query, system, limit)`, which runs against our DB. The model may only
  emit codes that came back from retrieval or this tool.
- Typed SDK errors (`Anthropic.RateLimitError`, etc.), not string matching.

### Finding schema (sketch)
```ts
type Finding = {
  id: string;
  kind: "missed_code" | "specificity_upgrade" | "edit_conflict" | "modifier_issue"
      | "cdi_query" | "unsupported_code" | "sequencing";
  system: "ICD10CM" | "ICD10PCS" | "HCPCS" | "CPT_OPAQUE";
  code?: string;
  replaces?: string;
  rationale: string;
  evidence: { quote: string; start: number; end: number }[]; // must be verbatim from input
  financialImpact?: { drgBefore?: string; drgAfter?: string; estDelta?: number; basis: string };
  confidence: "high" | "medium" | "low";
  source: "llm" | "rules";
};
```
Note `unsupported_code`: the app must also flag draft codes that the documentation does **not**
support, even when removing them lowers payment. This is the main compliance feature and a selling point.

## 7. Phased plan (each phase ends with green tests and a commit)

**Phase 0: Scaffold.** pnpm monorepo, the apps and packages above, lint/test/CI scripts, `.env.example`,
git-ignored `data/`. `pnpm dev` runs web + api.

**Phase 1: Code database.** Ingest ICD-10-CM (with tabular notes), ICD-10-PCS, and HCPCS. FTS search.
API: `GET /codes/search?q=&system=`, `GET /codes/:system/:code`. Web: search page with a code detail
drawer (hierarchy, notes, CC/MCC flag). Tests cover parsers using small fixture files.

**Phase 2: Rules engine.** Ingest NCCI PTP + MUE + CC/MCC + CC exclusions. Implement and unit-test
`checkNcci`, `checkMue`, `checkModifiers`, `checkExcludes1`, `checkSpecificity`. API:
`POST /validate` (codes in, rule findings out). No AI yet.

**Phase 3: AI analysis.** `packages/ai` pipeline from §4 with retrieval, validation, and quote verification.
API: `POST /analyze`. Web: Analyze screen with a two-pane layout (note with highlighted evidence | findings
list with accept/reject). Audit log persisted.

**Phase 4: DRG impact + CDI queries.** Simplified MS-DRG estimate (start with MDC 4 respiratory and MDC 5
circulatory, labeled "estimate"). Configurable base rate. CDI query drafts in a non-leading,
multiple-choice format that includes "clinically undetermined" and "other" options.

**Phase 5: Evals.** 25+ synthetic cases in `evals/cases/*.json` (note, setting, expected codes, expected
flags), including traps: a code that looks lucrative but isn't supported, Excludes1 pairs, and NCCI pairs.
`pnpm eval` reports precision/recall per code system and the **unsupported-code suggestion rate (target: 0)**.

## 8. Definition of done (MVP)
- Search returns relevant ICD-10/HCPCS codes in <200 ms locally
- Analyze returns findings for a synthetic inpatient case in <60 s, and every finding has verbatim evidence
- Zero LLM-suggested codes that are invalid/non-billable reach the UI (enforced in code + tested)
- Eval: ≥0.8 recall on expected codes, 0 unsupported suggestions on trap cases
- README explains setup, data refresh, and the compliance stance

## 9. Decisions made (see DECISIONS.md for the log)
- **Name:** Cleanclaim, at cleanclaim.app. The .com and .ai domains are taken; trademark check pending.
- **Focus: inpatient first.** ICD-10-CM/PCS are free (no CPT license needed), and a DRG/CC-MCC impact
  makes a strong per-case ROI demo. Demo cases come from MDC 4 (respiratory) and MDC 5 (circulatory).
- **Outpatient later.** Build the NCCI/MUE/modifier rules engine and HCPCS support now (Phase 2), but
  defer CPT-dependent outpatient features until there is an AMA CPT license.

## 10. Still open (Claude: don't block on these; pick a sensible default and note it in DECISIONS.md)
- Target customer: small/critical-access hospitals, or a specialty niche?
