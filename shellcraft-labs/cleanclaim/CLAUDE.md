# CLAUDE.md — Cleanclaim

Project brief: see `BRIEF.md`. Read it before starting any phase.

## Hard rules
- **Compliance first.** Never build a feature that recommends a code because it pays more. Only suggest
  codes supported by verbatim evidence in the input. Always flag unsupported draft codes, even when
  doing so lowers reimbursement.
- **No PHI.** Use only synthetic or de-identified data. Never commit real patient data. `data/` is git-ignored.
- **No CPT descriptors.** CPT content is AMA-licensed. CPT numbers may appear only as opaque user-entered strings.
- **Deterministic beats LLM.** Code validity, NCCI/MUE, CC/MCC, and DRG math come from the DB/rules
  engine. LLM output is validated against the DB before it reaches the UI.
- **Don't invent data sources or URLs.** Verify CMS/CDC download pages and record version and effective dates.

## Working conventions
- TypeScript strict mode, pnpm workspaces, Vitest, ESLint + Prettier.
- Work phase by phase (BRIEF.md §7). Finish each phase with passing tests and a commit.
- Small fixture files for parser tests. Never commit full CMS downloads.
- Claude API: `@anthropic-ai/sdk`, model `claude-opus-5-5`, structured outputs, explicit `effort`,
  no `budget_tokens`/disabled thinking/prefill/forced tool_choice, handle `refusal`.
- When a product decision is ambiguous, choose a sensible default, note it in `DECISIONS.md`, and keep going.
