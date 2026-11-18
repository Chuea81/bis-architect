# HANDOFF

> Updated at the end of every agent session. Newest entry on top. Keep each entry short.

## Template
```
### YYYY-MM-DD: <agent> (<branch>)
**Did:** what changed (files/areas)
**State:** tests green? deployed? anything broken?
**Next:** the single most important next step, and who owns it
**Open questions:** for the founder or the other agent
**Touched files outside my area:** (if any)
```

---

### 2026-11-18: Claude (claude/hospital-billing-codes-app-hbg2gj)
**Did:** Wrote BRIEF.md, AGENTS.md, CLAUDE.md, DECISIONS.md, the plan and review templates, and the Codex prompts.
**State:** Pre-build. No code yet.
**Next:** **Codex** reviews BRIEF.md using `prompts/codex-brief-review.md` and writes `reviews/phase-0-brief.md`.
Then Claude responds and starts Phase 0. Codex can start `prompts/codex-design-kickoff.md` in parallel.
**Open questions:** Target customer (small/critical-access hospitals vs. a specialty niche).
**Touched files outside my area:** none
