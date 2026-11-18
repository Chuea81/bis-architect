# Claude prompt: write the Phase 0 plan (no code)

Codex is reviewing BRIEF.md and will write `reviews/phase-0-brief.md`. Do not read or edit that file,
and do not edit HANDOFF.md, BRIEF.md, or DECISIONS.md right now.

Read AGENTS.md, HANDOFF.md, BRIEF.md, and DECISIONS.md first.

Your task: write `plans/phase-0-scaffold.md` using `plans/_template.md`, covering Phase 0 (monorepo
scaffold) and Phase 0.5 (Firebase skeleton) from BRIEF.md §7. Include:
- the exact folder/package layout and key dependencies with versions
- the root scripts (dev, test, lint, eval, deploy) and what each does
- how `packages/config/brand.ts` is set up so the product name lives only there
- the Firebase plan: Hosting rewrite to Cloud Run, Auth allowlist, Secret Manager for the
  Anthropic key, and the "synthetic data only" banner
- the Windows prerequisites (Node LTS, pnpm, firebase-tools, gcloud) and setup steps
- anything in BRIEF.md you think is wrong or risky for Phase 0, listed under "Risks / unknowns"

Do NOT write any code, install anything, or create other files. Set Status to "draft". Stop when
the plan is written and say it's ready.
