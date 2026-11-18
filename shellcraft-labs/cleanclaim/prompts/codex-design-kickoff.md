# Codex prompt: design system and first mockups (can run in parallel with Claude's Phase 0–1)

Paste everything below the line into Codex from inside the `cleanclaim/` folder.

---

You own design on Cleanclaim (see Roles in `AGENTS.md`). Read `AGENTS.md`, `HANDOFF.md`, and BRIEF.md §1–§4 first.
Work on branch `codex/design-system`.

**Audience:** hospital coders, CDI specialists, and revenue cycle directors. They spend hours a day in
dense software and value speed, clarity, and trust over flash. The design should feel clinical, calm, and
credible, and be accessible (WCAG 2.2 AA contrast, keyboard-first, works at 1280px and on a laptop at 125% zoom).

Deliver:
1. **Design tokens** in `packages/config/brand.ts` (name, tagline, colors including light and dark mode,
   type scale, spacing, radius) and a matching `tailwind` theme extension. The name "Cleanclaim" is
   provisional, so nothing else may hardcode it.
2. **Mockups** (static HTML/React in `design/mockups/` or images in `design/`) for:
   - **Analyze screen:** note on the left with highlighted evidence spans. Findings on the right, grouped by
     kind (missed code, specificity, edit conflict, unsupported code, CDI query), each with accept/reject/edit.
     "Unsupported code" findings must be as visually prominent as revenue findings.
   - **DRG impact card:** before/after DRG, weight, estimated $ delta, clearly labeled "estimate".
   - **Code search:** search box, results list, and a detail drawer (hierarchy, includes/excludes, CC/MCC badge).
   - The "synthetic data only" banner for the hosted demo.
3. **Logo:** 3–5 simple wordmark/icon options plus a favicon, in `apps/web/public/brand/`. Keep them plain and
   professional. No stock "doctor/patient" imagery and no AI-generated people.
4. `design/README.md` explaining the system, the reasoning, and open choices for the founder.

Don't touch `packages/ai`, `packages/rules`, `packages/db`, `packages/ingest`, or `apps/api`.
When done, add a HANDOFF.md entry and open a PR for Claude to review.
