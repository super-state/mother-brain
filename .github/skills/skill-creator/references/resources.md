# Skill Creator Resources

## Skill Development Best Practices

### GitHub Copilot Skills Documentation
- **Official Docs**: https://docs.github.com/en/copilot/using-github-copilot/using-extensions-to-integrate-external-tools-with-copilot-chat
- **Skills Architecture**: https://github.com/github/copilot-skills-docs
- **Agent Best Practices**: Design patterns for autonomous AI agents

### YAML Frontmatter Standards
- **Schema Validation**: Ensure all metadata fields are present and properly formatted
- **Required Fields**: name, description, allowed-tools
- **Optional Fields**: license, compatibility, metadata (domain, stage)
- **Naming Convention**: lowercase-hyphenated (e.g., "api-tester", "code-formatter")

### Wizard Pattern Design
- **User-Centered Design**: Nielsen Norman Group - https://www.nngroup.com/articles/wizard-design-pattern/
- **Progressive Disclosure**: Don't overwhelm users with all options at once
- **Multiple Choice UI**: Provide 2-3 diverse options + freeform for flexibility
- **Context Gathering**: Ask WHY before HOW - understand user intent first

### Research-Driven Development
- **Web Search Integration**: Use web_search to find current best practices during skill creation
- **Documentation First**: Always search for official docs before implementing
- **Reference Storage**: Save all research findings to skill's references/ folder for consistency

### Automation Principles
- **Do, Don't Delegate**: Skills should execute tasks, not ask users to run commands
- **Prerequisite Checking**: Verify external tools exist before using them
- **Error Handling**: Provide clear, actionable error messages
- **Output Testing**: Build it, run it, test it - prove it works before delivering

## Skill Composition Patterns

### Cross-Skill Collaboration
- **Detection**: Identify when another skill's expertise would improve results
- **Invocation**: Use `skill` tool to invoke other skills mid-execution
- **Integration**: Collect output and apply to current task
- **Example**: windows-app-builder invokes brand-guidelines-builder for UI design

### Common Collaboration Patterns
| Primary Skill | Invokes | For |
|---------------|---------|-----|
| Application builders | Design/branding skills | UI/UX guidance |
| API creators | Documentation skills | API reference docs |
| Database designers | Validation skills | Schema validation |
| Code generators | Testing skills | Test coverage |

## Folder Structure Requirements

### Mandatory Folders (as of 2025-01-12)
- **references/**: Research findings, documentation links, best practices
  - Minimum 2 files with substantive content
  - Must include resources.md with external links
- **scripts/**: Helper scripts, templates, validation utilities
  - Minimum 1 useful script or template
  - Alternative: templates.md with code snippets if no scripts needed

### Examples Structure
- **input-01.md**: Shows wizard interaction flow
- **output-01.md**: Demonstrates end-user accessible result
- Multiple examples for complex skills showing different scenarios

## Meta-Learning System

### Self-Improvement Loop
1. **Heal Phase**: User reports skill execution issue
2. **Analysis**: Identify root cause category
3. **Fix**: Apply specific correction to broken skill
4. **Learn**: Extract general lesson from specific issue
5. **Update**: Modify skill-creator to prevent similar flaws in future skills
6. **Document**: Record what was learned for transparency

### Root Cause Categories
- Missing automation (skill delegated work to user)
- Missing prerequisite checks (failed due to missing tools)
- Poor error handling (silent failures, unclear errors)
- Documentation mismatch (instructions don't match behavior)
- Inadequate testing (didn't verify output actually works)

## Validation Checklist

When creating or updating skills, verify:
- ✅ YAML frontmatter parses correctly
- ✅ Name follows lowercase-hyphenated convention
- ✅ Step 1 is a wizard that gathers context via ask_user
- ✅ Instructions are actionable and specific
- ✅ Examples demonstrate wizard flow and output
- ✅ references/ has ≥2 files with content
- ✅ scripts/ has ≥1 useful file
- ✅ ask_user in allowed-tools
- ✅ All required tools listed
- ✅ Includes automation (doesn't delegate to user)
- ✅ Checks prerequisites before executing
- ✅ Has error handling with actionable messages
- ✅ Tests output to verify it works
- ✅ Considers skill composition opportunities
