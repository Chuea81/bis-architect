# Codex prompt: review the brief (run first, before any code)

Paste everything below the line into Codex from inside the `cleanclaim/` folder.

---

You are the reviewer on Cleanclaim, an AI coder copilot for hospital revenue cycle teams. Claude Code is the
builder. Nothing has been built yet. Your review now is the cheapest point to catch mistakes.

Read, in order: `AGENTS.md`, `HANDOFF.md`, `BRIEF.md`, `DECISIONS.md`.

Then write `reviews/phase-0-brief.md` using `reviews/_template.md`. Do **not** edit BRIEF.md or any other file.

Cover:
1. **Top 10 risks or gaps** in the brief, ranked. Consider technical, data, compliance/legal, product, and cost.
2. **Compliance holes.** Find any way the design could suggest, display, or nudge toward a code the
   documentation doesn't support (upcoding), leak PHI, or expose CPT content. Be adversarial.
3. **Data reality check.** Are the CMS/CDC datasets in §5 the right ones for an inpatient MVP? Is anything
   missing (e.g. MS-DRG grouper logic, POA indicators, MCE edits)? Is anything harder to parse than the brief assumes?
4. **Scope.** What would you cut from the MVP to ship a convincing demo faster? What's missing that a hospital
   coding manager would expect to see in a demo?
5. **Architecture.** Is SQLite + FTS5, with the code DB baked into a Cloud Run image, sound? Does the LLM↔rules
   split in §4 hold up? Simpler alternatives?
6. **The AI pipeline.** Weak points in retrieval → LLM → validation, especially around quote verification,
   retrieval misses, and confidence scoring.
7. **Evals.** Is §7 Phase 5 strong enough? Propose 5 specific trap cases (describe them; don't write the charts yet).
8. **Phase order.** Should anything move earlier or later?

Rules: be specific (section or line + problem + concrete fix), mark each finding `must-fix` or `suggestion`,
and don't pad. If something is good, say so briefly under "What's good". When finished, add a HANDOFF.md
entry saying the review is ready for Claude.
