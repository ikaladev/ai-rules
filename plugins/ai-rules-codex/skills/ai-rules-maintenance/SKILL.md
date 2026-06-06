---
name: ai-rules-maintenance
description: Maintain project AI assistant rule files with Ai_Rules.md as the source of truth. Use when the user asks Codex to audit, create, consolidate, synchronize, or explain AI rules for Cursor, Copilot, Claude, Windsurf, Cline, Aider, AGENTS.md, or agents.md.
---

# AI Rules Maintenance

Use this skill to help maintain shared AI assistant instructions for a project. The preferred source of truth is `Ai_Rules.md`; generated targets include `.cursorrules`, `.github/copilot-instructions.md`, `.windsurfrules`, `.clinerules`, `.aider.conf.yml`, `CONVENTIONS.md`, `CLAUDE.md`, and `agents.md`/`AGENTS.md`.

## Workflow

1. Inspect the workspace before changing files.
   - Prefer `npm run ai-rules:status -- --json` when the project has this package installed.
   - Use `npm run ai-rules:scan -- --json` for detailed file status.
   - If those scripts are unavailable, inspect the known rule filenames directly.

2. Explain the current state plainly.
   - Identify whether `Ai_Rules.md` exists.
   - List synced, outdated, missing, and unknown rule files.
   - Call out duplicate or conflicting instruction files when visible.

3. Choose the smallest safe action.
   - To initialize: `npm run ai-rules:init -- --yes`.
   - To synchronize everything: `npm run ai-rules:sync -- --yes`.
   - To synchronize one target: `npm run ai-rules:sync -- --target <id> --yes`.
   - To consolidate scattered files: `npm run ai-rules:consolidate -- --yes`.

4. Preserve user-authored content.
   - Do not delete original rule files unless the user explicitly asks.
   - Consolidate before overwriting when there are valuable scattered rules.
   - Mention that generated target files may be overwritten by sync.

5. Verify after any write.
   - Run `npm run ai-rules:status -- --json` or `npm run ai-rules:scan -- --json`.
   - Summarize exactly what changed.

## Targets

Use these target ids with `--target`:

- `cursor`
- `copilot`
- `windsurf`
- `cline`
- `aider`
- `aider-conventions`
- `claude`
- `agents`

## Codex Guidance

Prefer maintenance reasoning over blind generation. When rules conflict, explain the conflict and suggest a canonical version for `Ai_Rules.md`. Keep `AGENTS.md` and `agents.md` in mind as equivalent generic-agent destinations; the engine writes `agents.md` by default and detects `AGENTS.md` when present.
