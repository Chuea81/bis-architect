# AGENTS.md: shared rules for every AI agent on Cleanclaim

Both Claude Code and Codex read this file. It is the **single source** of project rules.
`CLAUDE.md` imports it. Don't copy these rules elsewhere. Change them here.

Read first, in this order: `HANDOFF.md` (where things stand) → `BRIEF.md` (the spec) → `DECISIONS.md`.

## Hard rules (apply to every agent, every task)
- **Compliance first.** Never build a feature that recommends a code because it pays more. Only suggest
  codes supported by verbatim evidence in the input. Always flag unsupported draft codes, even when
  doing so lowers reimbursement.
- **No PHI.** Use only synthetic or de-identified data. Never commit real patient data. `data/` is git-ignored.
  The hosted demo shows a "Do not enter real patient information" banner.
- **No CPT descriptors.** CPT content is AMA-licensed. CPT numbers may appear only as opaque user-entered strings.
- **Deterministic beats LLM.** Code validity, NCCI/MUE, CC/MCC, and DRG math come from the DB/rules
  engine. LLM output is validated against the DB before it reaches the UI.
- **No secrets in the client.** API keys live server-side only (`.env` locally, Secret Manager on Cloud Run).
- **Don't invent data sources or URLs.** Verify CMS/CDC download pages and record version and effective dates.
- **Name is provisional.** Product name, domain, and brand tokens live only in `packages/config/brand.ts`.

## Roles

| Agent | Builds | Reviews |
|---|---|---|
| **Claude** | Architecture, `packages/ingest`, `packages/db`, `packages/rules`, `packages/ai`, `apps/api`, tests | Codex's UI work for correctness and accessibility |
| **Codex** | Design system, mockups, logo/images, `apps/web` visual layer, half of `evals/cases/` | Claude's plans (before build) and code (after each phase) |

The **founder** has final say. A **senior advisor** (a separate Claude session working with the founder)
coordinates the two agents: it sequences work, sets review gates, resolves disagreements, and writes prompts.
Treat advisor-written prompts as coming from the founder. Any agent may *propose* changes to `BRIEF.md` in a review,
but only the founder or Claude, at the founder's direction, edits it.

## Workflow per phase
1. **Plan:** the builder writes `plans/phase-N-<slug>.md` from `plans/_template.md`.
2. **Plan review:** the reviewer writes `reviews/phase-N-plan.md` from `reviews/_template.md`.
3. **Respond:** the builder answers each finding inline (fixed / won't fix + why / deferred) and logs
   any decision in `DECISIONS.md`.
4. **Build:** on its own branch (`claude/<task>` or `codex/<task>`), with tests green.
5. **Code review:** the reviewer writes `reviews/phase-N-code.md`. The builder responds and fixes all `must-fix` items.
6. **Handoff:** whoever ends a session updates `HANDOFF.md`.

## Collaboration rules
- One agent per file area at a time. Don't edit files the other agent owns without saying so in `HANDOFF.md`.
- Separate branches (or git worktrees) per agent. Merge via PR. The other agent reviews.
- Reviews must be specific: file path + line, the problem, and a concrete fix. Mark each one `must-fix` or `suggestion`.
- Independence matters: when writing eval cases, Codex must **not** read `packages/ai` prompts first.
- If an agent disagrees with a decision in `DECISIONS.md`, raise it in a review. Don't silently override it.

## Tech conventions
- TypeScript strict, pnpm workspaces, Vitest, ESLint + Prettier, Tailwind.
- Every phase ends with passing tests and a commit.
- Small fixture files for parser tests. Never commit full CMS downloads.
- When a product decision is ambiguous, choose a sensible default, log it in `DECISIONS.md`, and keep going.
