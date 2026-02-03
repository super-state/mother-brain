# Skill Schema (Official GitHub Copilot Agent Skills Format)

Based on official documentation from GitHub, VS Code, and the parser specification.

## SKILL.md Structure

Every agent skill must have exactly two parts:

1. **YAML Frontmatter** (required)
2. **Markdown Body** (instructions for the agent)

## YAML Frontmatter Fields

### Required Fields

- **name**: Skill identifier
  - Must match: `^[a-z][a-z0-9]*(-[a-z0-9]+)*$`
  - Lowercase, hyphenated only
  - Example: `markdown-formatter`, `design-tokens`

- **description**: What the skill does and when to use it
  - Max 1024 characters
  - Should be clear and concise
  - Example: "Format markdown files with consistent headings and code blocks."

### Optional Fields

- **license**: SPDX license identifier
  - Example: `MIT`, `Apache-2.0`
  
- **compatibility**: Version constraints
  - Example: `python>=3.8`, `node>=18`
  
- **metadata**: Free-form key/value pairs
  - Any custom fields you need
  - Example:
    ```yaml
    metadata:
      domain: ui
      stage: alpha
      priority: high
    ```

- **allowed-tools**: Space-separated tool names (experimental)
  - Example: `bash python node`

## Complete Template

```yaml
---
name: your-skill-name
description: One or two sentences describing when and why the agent should use this skill.
license: MIT
compatibility: node>=18
metadata:
  domain: category
  stage: alpha
allowed-tools: bash python node
---

# Skill Instructions

## Purpose
Explain what this skill helps the agent do.

## When to Use
List the scenarios when this skill should activate.

## Steps
1. Clear, actionable instructions
2. Include code examples
3. Show expected outputs

## Examples
Show example prompts and results.
```

## Directory Structure

Skills must be organized as:

```
.github/
  skills/
    skill-name/
      SKILL.md          ← Required
      scripts/          ← Optional
      resources/        ← Optional
      examples/         ← Optional
```

### Rules

- Folder name should match the `name` field (recommended)
- Must be lowercase, hyphenated
- File must be named exactly `SKILL.md` (uppercase)
- Supporting files are optional

## References

- GitHub Copilot Documentation: docs.github.com
- VS Code Documentation: code.visualstudio.com  
- Parser Specification: deepwiki.com

## What's NOT Supported

The following are NOT part of the official specification:
- Custom fields like `triggers`, `scope`, `done_when`, `self_heal`
- Auto-execution or skill routing (up to agent implementation)
- Complex validation schemas
- Version fields (use git tags instead)

If you need these features, implement them in your agent's custom parser.
