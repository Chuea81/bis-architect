# CLAUDE.md — Cleanclaim

Shared rules, roles, and workflow for all agents:

@AGENTS.md

## Claude-specific
- You are the **builder** for architecture, data, rules, AI pipeline, and API (see Roles in AGENTS.md).
  Codex reviews your plans and code. Write a plan in `plans/` and wait for its review before large builds.
- Respond to every finding in `reviews/` inline. Don't delete review files.
- Claude API: `@anthropic-ai/sdk`, model `claude-opus-5-5`, structured outputs, explicit `effort`,
  no `budget_tokens`/disabled thinking/prefill/forced tool_choice, handle `refusal`, server-side fallbacks on.
  Details in BRIEF.md §6.
- Update `HANDOFF.md` before ending a session.
