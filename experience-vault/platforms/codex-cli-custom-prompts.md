# Codex CLI - Custom Prompts & Slash Commands

## Problem
Users expect `/skill-name` to work in Codex CLI but skills use `$skill-name` syntax. Slash commands (`/`) are reserved for built-in commands and custom prompts.

## Gotcha
Codex CLI has **two separate invocation systems**:

1. **Skills** (`.agents/skills/`): Invoked with `$skill-name`. Auto-discovered from directory.
2. **Custom Prompts** (`~/.codex/prompts/`): Invoked with `/prompts:command-name`. Markdown files with frontmatter.

These are independent systems. A skill in `.agents/skills/` does NOT create a slash command.

## Solution
To support both invocation methods, create BOTH:

1. **Skill** in `.agents/skills/[name]/SKILL.md` → enables `$name`
2. **Custom prompt** in `~/.codex/prompts/[name].md` → enables `/prompts:name`

Custom prompt file format:
```markdown
---
description: Brief description for UI discoverability
argument-hint: [optional] ARG="<value>"
---

Read and follow the complete instructions in ~/path/to/SKILL.md

This is the [name] skill. Follow all steps defined in that file.
```

Key notes:
- Prompt files are loaded from `~/.codex/prompts/` only (not subdirectories)
- Restart Codex CLI after adding new prompts
- Use `/prompts` or `/help` to list available commands
- Command names must not conflict with built-ins (`/init`, `/quit`, etc.)

**When to Consult**: Step 3.6.2 (project initialization), any CLI integration work

## Related Gotchas
See also:
- experience-vault/platforms/windows-junctions-git.md (symlink/junction for .agents/skills/)

## Sources
- https://developers.openai.com/codex/custom-prompts
