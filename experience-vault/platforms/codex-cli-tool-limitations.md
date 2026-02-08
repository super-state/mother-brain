# Codex CLI - Tool Availability Limitations

## Problem
Skills that use `ask_user` tool for interactive menus fail in Codex CLI with:
"ask_user is not available in this runtime, so reply with the exact option text (or a custom action)."

## Gotcha
Different agent runtimes have different tool availability:

| Tool | GitHub Copilot CLI | Codex CLI | IDE Extensions |
|------|-------------------|-----------|----------------|
| `ask_user` | ✅ | ❌ | Varies |
| `powershell`/`bash` | ✅ | ✅ | ✅ |
| `view`/`edit`/`create` | ✅ | ✅ | ✅ |
| `web_search` | ✅ | Varies | Varies |

Skills MUST NOT assume any interactive UI tool exists. Always include a plain-text fallback.

## Solution
When writing SKILL.md files, include a runtime fallback rule:

```markdown
- **RUNTIME FALLBACK**: If `ask_user` is not available, present choices as numbered plain text:
  1. Option A
  2. Option B
  3. Option C
  Reply with the number or option text.
```

This ensures skills work across ALL agent runtimes without modification.

**When to Consult**: When creating any new skill that uses interactive tools

## Related Gotchas
See also:
- experience-vault/platforms/codex-cli-custom-prompts.md

## Sources
- Discovered via user testing Mother Brain in Codex CLI (2026-02-08)
