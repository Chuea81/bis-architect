# Cleanclaim (Shellcraft Labs)

An AI coder copilot for hospital revenue cycle teams. It finds codes that are documented but missed,
catches NCCI/MUE/modifier denials before submission, drafts compliant CDI queries, and shows the DRG impact
of supported codes. It suggests; humans decide.

Status: **pre-build.** Inpatient-first MVP. Hosted demo on Firebase (`*.web.app`); name is provisional.

## Built by two agents
Claude Code builds the backend, data, rules, and AI. Codex reviews plans and code, and owns design and images.
See `AGENTS.md` for roles and the per-phase workflow.

## Start here
1. **Codex:** paste `prompts/codex-brief-review.md` → writes `reviews/phase-0-brief.md`
2. **Claude:** `claude "Read HANDOFF.md and reviews/phase-0-brief.md, respond to each finding, then start Phase 0."`
3. **Codex (in parallel):** paste `prompts/codex-design-kickoff.md`

## Files
| File | Purpose |
|---|---|
| `BRIEF.md` | Full MVP spec and phased plan |
| `AGENTS.md` | Shared rules, roles, workflow (read by both agents) |
| `CLAUDE.md` | Imports AGENTS.md + Claude-specific notes |
| `HANDOFF.md` | Where things stand. Updated every session |
| `DECISIONS.md` | Log of product decisions |
| `plans/` | One plan per phase (`_template.md`) |
| `reviews/` | One review per plan/code review (`_template.md`) |
| `prompts/` | Ready-to-paste prompts for Codex |
