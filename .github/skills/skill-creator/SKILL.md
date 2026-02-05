---
name: skill-creator
description: Create (and continuously improve) new GitHub Copilot Agent Skills by generating high-quality SKILL.md files and examples.
license: MIT
compatibility: node>=18
metadata:
  domain: meta
  stage: production
allowed-tools: bash node view grep glob web_search ask_user powershell create edit skill
---

# Skill Creator

Use this skill when the user wants a new reusable capability, or when you notice repeated work that should be turned into a skill.

## Purpose

Create a complete skill folder at `.github/skills/<skill-name>/` with:
- `SKILL.md` (clear instructions + constraints + validation)
- `examples/` (at least one input and expected output)
- `references/` (research findings, best practices, documentation links)
- `scripts/` (helper scripts, templates, automation utilities)

This skill is optimized for *minimal prompts, maximal clarity*, and iterative improvement.

## Operating principles

- Prefer **small, focused skills** over "do everything" skills.
- Each step must be **observable** (creates/changes something, or produces a checkable result).
- Keep the description **one sentence** (when/why to use).
- Include a **validation section** so success is unambiguous.
- **Research first**: Check existing repo files/docs and search the web for best practices during skill creation (after wizard completes). All research findings MUST be saved to the skill's `references/` folder.
- **Mandatory folders**: Every skill MUST have `references/` and `scripts/` folders with meaningful content. Empty folders are not acceptable.
- **Product owner mindset**: Treat users as product owners, not developers. Ask about problems, pain points, and desired outcomes—not technical configurations.
- **Problem-solving questions**: Focus on understanding what the user wants to achieve and why, not how they think it should be built.
- **Wizard interface**: Use numbered multiple-choice questions (up to 3 options + freeform) that users can select via arrow keys or number keys.
- **Varied options**: Provide diverse approaches as choices, including combination options like "Both of the above" or "All three approaches."
- **Agent-driven naming**: Never ask users what to name the skill—the agent always decides the name based on understanding the user's needs, following lowercase-hyphenated format (e.g., "markdown-formatter", "api-tester", "git-workflow-helper").
- **Wizard pattern propagation**: ALL created skills MUST use the same wizard pattern to gather information from their users. Created skills should ask contextual questions to understand user intent, not assume technical knowledge.
- **End-user accessibility**: Consider how users will interact with the skill's output. If creating applications/tools, assume non-technical end users who want to launch and use the result, not edit code. Make outputs immediately usable in the simplest way possible.
- **Automation-first**: Skills should automate everything possible. Never delegate manual steps to users if the skill can do it automatically.
- **Check prerequisites**: Skills that require external tools/SDKs must check for them before executing and provide clear installation guidance.
- **Error handling**: Skills must handle failures gracefully with actionable error messages, not silent failures.
- **TEST OUTPUT**: Skills MUST verify their output actually works before claiming success. Build it, run it, test it. Don't assume—prove.
- **Continuous self-improvement**: When the Heal function fixes a skill execution issue, extract the general lesson and update skill-creator itself to prevent creating skills with similar flaws in the future.
- **Skill composition**: Skills should detect when they need expertise from another skill and invoke it using the `skill` tool. This allows skills to collaborate and combine their capabilities for better results.
- **Guided external service setup**: When skills require external services (databases, APIs, cloud platforms), NEVER dump technical instructions on the user. Instead:
  - Explain in plain language WHAT the service does and WHY it's needed
  - Estimate time required ("This takes about 5 minutes")
  - Guide step-by-step with checkpoints ("Did that work? Great, let's continue...")
  - Translate technical terms into user-friendly language (e.g., "API key" → "secret password for your app")
  - Offer to pause and resume later if the setup is complex
  - Consider the user as a product owner, not a developer

## Steps

1. **Show Welcome Menu**
   - Display: "🎯 Welcome to Skill Creator!"
   - Present 6 numbered options using `ask_user` tool (numbers only in choices, not duplicated in text):
     1. Create new skill
     2. Update existing skill
     3. Heal skill (fix/validate)
     4. Use a skill
     5. View all skills
     6. Delete skill
   - After any action completes (or is cancelled), return to main menu
   - Proceed based on user's choice

2. **Collect inputs** (based on option selected)
   
   **If "Create new skill":**
   
   **WIZARD PHASE (interactive CLI):**
   - Display: "📋 Skill Creation Wizard" (number of questions varies based on context)
   - Ask contextual questions to understand user needs, pain points, and desired outcomes
   - Treat the user as a product owner—focus on WHAT they want to achieve and WHY, not HOW
   - For each question, use `ask_user` with:
     - Up to 3 varied, diverse approaches as `choices`
     - Options can include combinations: "Both A and B", "All of the above"
     - Freeform input always available (automatically added by UI)
     - Users can navigate with arrow keys or press numbers (1-3)
   
   **Question strategy (adapt based on user's problem):**
   - Start with: **What problem are you trying to solve?** or **What's the pain point you're experiencing?**
   - Follow with contextual questions that dig deeper:
     - "What would success look like for you?"
     - "Who will be using this and in what situations?"
     - "What are the biggest challenges you face with this task?"
     - "How often do you encounter this problem?"
     - "What have you tried so far that hasn't worked?"
   
   **Never ask:**
   - ❌ "What should we name this skill?" (Agent decides based on understanding)
   - ❌ "What tools should this use?" (Technical question - agent decides)
   - ❌ "What domain?" (Technical categorization - agent decides)
   - ❌ Technical configuration questions
   
   **Always infer from context:**
   - Skill name (from problem understanding)
   - Technical implementation details (from user needs)
   - Tools and domain (from problem domain)
   
   **REVIEW PHASE:**
   - Display summary showing what the agent understood:
     - Problem statement
     - Proposed solution approach
     - Key capabilities
     - (Skill name decided by agent - shown but not editable)
   - Ask: "✅ Does this capture what you need? Submit or refine?" 
   - Choices: "Submit and create", "Refine the approach", "Start over"
   - If refining, ask what aspect needs adjustment
   
   **RESEARCH PHASE (after wizard is complete):**
   - Check `.github/skills/` folder for similar skills and reference materials
   - Use `view` to read existing skill examples for patterns
   - Use `web_search` to find best practices, current standards, and reference materials for the skill domain
   - **MANDATORY**: Save ALL research findings to skill's `references/` folder
   - Use research to inform the SKILL.md structure and content
   
   **If "Update existing skill":**
   - Ask which skill to update (with option to return to menu)
   - Ask what changes to make
   - After completion, return to main menu
   
   **If "Heal skill":**
   - Ask which skill to validate/fix (with option to return to menu)
   - Ask: "What needs healing?" with options:
     1. Validate the skill file (check structure and format)
     2. Test and fix a recent skill execution (analyze output and fix errors)
     3. Both validation and execution testing
   - If option 1 (Validate): Run validation checks on SKILL.md structure
   - If option 2 or 3 (Test execution):
     - Ask user to describe what happened when they used the skill
     - Review the skill's output (files created, errors encountered)
     - Identify issues (missing dependencies, incorrect paths, build failures, etc.)
     - Re-execute the skill with fixes, OR update the skill instructions to prevent the issue
   - After completion, return to main menu
   
   **If "Use a skill":**
   - List all available skills to choose from
   - Include "Return to menu" as first option
   - After user selects a skill:
     - Invoke the skill using `skill` tool
     - The skill runs its wizard and completes its task
   - After skill completes, return to main menu
   
   **If "View all skills":**
   - List all skills in `.github/skills/`
   - Show name, description, and status
   - Automatically return to main menu after display
   
   **If "Delete skill":**
   - List all available skills to choose from
   - Include "Return to menu" as first option
   - After user selects a skill to delete, ask confirmation:
     - "⚠️ Are you sure you want to delete [skill-name]? This cannot be undone."
     - Choices: "Yes, delete it", "No, cancel"
   - If confirmed, delete entire skill folder
   - Show success/cancellation message
   - Return to main menu

3. **Execute selected action**
   
   **For Create:**
   - Generate the skill skeleton using collected information
   - Create `.github/skills/<skill-name>/SKILL.md` with:
     - Proper YAML frontmatter (include `ask_user` in allowed-tools)
     - Clear purpose and operating principles
     - **Step 1 MUST be a wizard phase** that uses `ask_user` to gather context:
       - Ask problem-focused questions (not technical config)
       - Provide 2-3 varied options per question
       - Understand user intent before proceeding
       - Consider: Is this creating something new or updating existing?
       - Consider: How will the end user access/use the output?
     - Subsequent steps for execution based on gathered info
     - Validation criteria
     - **Accessibility note**: If skill creates applications/tools, include guidance on making output immediately usable (e.g., executable files, launcher scripts, not just source code)
   - Create `.github/skills/<skill-name>/examples/input-01.md` showing wizard interaction
   - Create `.github/skills/<skill-name>/examples/output-01.md` showing end-user accessible result
   - **MANDATORY**: Create `.github/skills/<skill-name>/references/` folder with:
     - `resources.md` - Links to external documentation, tutorials, best practices
     - Research findings from web_search (save as markdown files)
     - Related technology documentation
     - **MUST contain at least 2 files** with substantive content
   - **MANDATORY**: Create `.github/skills/<skill-name>/scripts/` folder with:
     - Helper scripts relevant to the skill's domain
     - Template files or configuration examples
     - Validation or testing utilities
     - **MUST contain at least 1 useful script or template** that supports the skill's purpose
     - If no scripts are needed, include a `templates.md` with useful templates/snippets
   - **After skill is created, ask user**:
     - "Would you like to use this skill now?"
     - Choices: "Yes, use it now", "No, just return to menu"
     - If "Yes": Execute the skill inline by following its SKILL.md instructions directly
     - If "No": Return to main menu
   
   **For Update:**
   - Modify the existing SKILL.md
   - Update examples if needed
   - **Update or create references folder** if needed (ensure at least 2 files with content)
   - **Update or create scripts folder** if needed (ensure at least 1 useful script/template)
   - Return to main menu after completion
   
   **For Use:**
   - Check if the skill exists in `.github/skills/`
   - **IMPORTANT**: Newly created skills in the current session cannot be invoked yet
   - If the skill was just created:
     - Inform user: "This skill was just created and will be available next session"
     - Offer to execute the skill's functionality manually (follow its steps directly)
     - Return to main menu
   - If the skill exists from a previous session:
     - Invoke using `skill` tool: `skill <skill-name>`
     - Let the skill run its complete workflow
     - Return to main menu after skill completes
   
   **For Heal:**
   
   **If validating skill structure:**
   - Validate YAML frontmatter
   - Check `name` matches `^[a-z][a-z0-9]*(-[a-z0-9]+)*$`
   - Verify instructions are actionable
   - Check examples exist and are complete
   - Fix any structural issues found
   
   **If testing/fixing skill execution:**
   - Ask user what happened during skill execution
   - Examine the output/artifacts created by the skill
   - Identify errors:
     - Build failures (missing SDKs, dependencies)
     - Runtime errors (incorrect paths, missing files)
     - Logic errors (skill produced wrong output)
     - Documentation errors (instructions don't match reality)
   - Determine fix strategy:
     - **Quick fix**: Re-execute the skill with corrections (e.g., fix paths, add missing files)
     - **Skill update**: If the skill itself has flaws, update SKILL.md to prevent future issues
     - **Environment issue**: Guide user to install missing dependencies
   - Apply the fix and verify it works
   - Document what was fixed in a brief summary
   
   **Self-Improvement (Critical):**
   - After fixing the issue, analyze the root cause
   - Extract the general lesson learned (not just the specific fix)
   - Update skill-creator itself to prevent creating skills with similar flaws:
     - If issue was "skill didn't check prerequisites" → Add to skill creation template: "Always check prerequisites before executing"
     - If issue was "skill asked user to do manual steps" → Add principle: "Automate everything possible, don't delegate to user"
     - If issue was "skill had missing error handling" → Add to validation: "Check for error handling in generated skills"
   - Update the relevant section of skill-creator/SKILL.md:
     - Operating Principles (if it's a broad principle)
     - Wizard Pattern for Created Skills (if it's about how skills should behave)
     - Validation Checklist (if it's something to check during creation)
   - Briefly explain what was learned and how it will prevent future issues
   
   - Return to main menu after completion
   
   **For Delete:**
   - Use `powershell` tool to remove entire skill directory
   - Command: `Remove-Item -Path ".github/skills/<skill-name>" -Recurse -Force`
   - Display success message with skill name
   - Return to main menu

4. **Validate before finishing** (for Create/Update/Heal)
   - YAML frontmatter parses correctly
   - `name` matches naming pattern `^[a-z][a-z0-9]*(-[a-z0-9]+)*$`
   - Instructions are actionable (no vague "make it better" steps)
   - **Step 1 includes wizard pattern** with `ask_user` for gathering context
   - Examples are present, clear, and demonstrate the skill
   - Examples show wizard interaction and end-user accessible output
   - **MANDATORY FOLDERS CHECK**:
     - `references/` folder exists with at least 2 files containing substantive content
     - `scripts/` folder exists with at least 1 useful script, template, or helper file
     - No empty folders allowed
   - `ask_user` is included in `allowed-tools`
   - All other required tools are listed in `allowed-tools`
   - If skill creates applications/tools, validation includes accessibility considerations
   - **Automation check**: Skill automates execution—doesn't ask user to run manual commands
   - **Prerequisites check**: If skill requires external tools, it checks for them first
   - **Error handling**: Skill includes error handling with clear, actionable messages
   - **Skill composition**: If skill's domain could benefit from other skills' expertise, it checks for and invokes them

5. **Self-improve** (continuous learning loop)
   
   **After creating/updating a skill:**
   - If a skill is later healed due to execution issues, capture the lesson learned
   - Update skill-creator itself to prevent similar issues in future skill creations
   
   **After healing a skill:**
   - Identify the root cause category:
     - Missing automation (skill asked user to do manual work)
     - Missing prerequisite checks (skill failed due to missing tools/SDKs)
     - Poor error handling (silent failures or unclear errors)
     - Documentation mismatch (instructions don't match behavior)
   - Extract the general principle (not just the specific fix)
   - Update skill-creator's Operating Principles, Wizard Template, or Validation Checklist
   - Document the improvement for transparency
   
   **Examples of self-improvement:**
   - Issue: "windows-app-builder created files but didn't build the app"
   - Lesson: Skills should automate execution, not delegate to users
   - Update: Add "Automation-first" to Operating Principles + "Prerequisites check" step to template
   
   This creates a feedback loop where skill-creator gets better with each healing session.

## Wizard Best Practices

**Research Before Asking:**
- Use `web_search` to find best practices and reference materials AFTER the wizard completes and you know what skill to research
- Check existing skills for structural patterns to inform the SKILL.md format
- Research happens after scoping, not before

**Question Design:**
- Start with problem identification: "What problem are you trying to solve?"
- Ask contextual follow-up questions based on the problem domain
- Focus on user needs, frequency, impact, and desired outcomes
- Provide 2-3 varied approaches that solve the problem differently
- Include combination options when appropriate ("Both approaches", "All three")
- Never ask technical questions (naming, tools, domains)
- Display progress: "Question X" (variable number based on context)

## Wizard Pattern for Created Skills

**CRITICAL**: Every skill you create MUST include a wizard phase as Step 1. This ensures all skills gather context intelligently before executing.

**Wizard Template for New Skills:**
```markdown
## Steps

1. **Gather Context via Wizard**
   - Use `ask_user` tool to understand user intent
   - Ask 3-5 contextual questions about:
     - What they're trying to achieve
     - Current situation (new or updating existing?)
     - Desired outcome and how they'll use it
     - Any constraints or preferences
   - Provide 2-3 varied options per question
   - Consider accessibility: How will end user interact with the output?
   
   Example questions:
   - "What are you trying to create/accomplish?"
   - "Is this a new project or updating something existing?"
   - "Who will use this? (You, your team, end users)"
   - "How do you want to access/launch the result?"
   
2. **Research & Plan** (based on wizard responses)
   - Use gathered context to inform approach
   - Research best practices for the specific use case
   - Determine appropriate tools and technologies
   
3. **Check Prerequisites** (if skill requires external tools)
   - Use `powershell` or `bash` to check if required tools are installed
   - Examples: "dotnet --version", "python --version", "node --version"
   - If missing:
     - Provide clear installation instructions
     - Offer automated installation if possible
     - Ask user if they want to proceed without prerequisites (and what that means)
   - Never assume prerequisites exist—always verify
   
4. **Execute** (create/update based on plan)
   - Perform the actual work automatically
   - Don't ask user to run manual commands
   - Handle errors with clear, actionable messages
   - Test that output actually works
   - **Check for skill collaboration opportunities**:
     - If task requires expertise from another domain, invoke related skills
     - Example: Building a UI? Invoke design/branding skills for visual guidance
     - Example: Creating API? Invoke documentation skills for API docs
     - Use `skill` tool to invoke other skills mid-execution
     - Collect their output and integrate into current task
   ...

5. **Validate & Test** (verify success)
   - Check that expected files/outputs were created
   - **CRITICAL**: Test functionality—don't just check files exist
   - For applications: Build, publish, and LAUNCH to verify it works
   - For scripts: Actually run them to verify they execute
   - For documents: Open and verify they're properly formatted
   - Provide clear success/failure feedback based on ACTUAL testing
   
6. **Deliver Results**
   - Summarize what was created
   - Provide immediate next steps (how to use/launch the output)
   - Offer to make adjustments if needed
```

**Key Requirements for All Created Skills:**
- ✅ **Automate execution**: Don't tell user to run commands—do it for them
- ✅ **Check prerequisites**: Verify external tools exist before using them
- ✅ **Handle errors**: Provide clear, actionable error messages
- ✅ **Test output**: Build it, run it, test it—verify it ACTUALLY works before delivering
- ✅ **End-user focus**: Make output immediately usable
- ✅ **Skill composition**: Detect when another skill's expertise would help and invoke it

**Continuous Learning Architecture (MANDATORY)**:

Skills are LIVING systems that learn continuously, not static templates. Each skill must:

**1. Initial Domain Discovery (At Creation Time):**
- Use `web_search` to research: "[domain] requirements discovery checklist" and "[domain] common user frustrations"
- Extract domain-appropriate discovery questions dynamically from research
- Store research findings in skill's `references/` folder
- Build initial wizard from research, not hard-coded knowledge

**2. Continuous Learning During Execution:**
- When user expresses frustration or confusion → skill triggers self-analysis
- When multiple iteration cycles occur → skill logs pattern for improvement
- When validation fails → skill traces root cause back through pipeline
- Skills maintain their own `learnings.md` file that accumulates execution patterns

**3. Self-Healing After Friction:**
- When friction detected, skill asks: "What would have prevented this frustration?"
- Check existing research: "Did we already have knowledge that wasn't applied?"
- Identify if NEW research is needed: "Is this a gap in our domain understanding?"
- Trace pipeline: "Where upstream could this have been caught/prevented?"
- Update skill's own SKILL.md with improved patterns

**4. Pre-emptive Frustration Detection (Built Into Skills):**
- Each skill should include a section: "Common Frustration Points"
- Before executing, skills ask internally: "What typically frustrates users here?"
- Skills research common pitfalls: "[domain] common mistakes" and "[domain] user pain points"
- Address likely frustrations BEFORE they happen, not after

**5. Pipeline Tracing (Root Cause Without Domain Knowledge):**
- When something goes wrong, DON'T add domain knowledge to Mother Brain/skill-creator
- Instead ASK: "What PROCESS failed that allowed this to happen?"
- Update the PROCESS (research step, validation step, discovery question pattern)
- The fix is always: "How do we learn this dynamically?" not "Remember this fact"

**The Meta-Pattern:**
- Mother Brain = Process orchestrator (no domain knowledge)
- Skill-Creator = Skill factory + learning architecture (no domain knowledge)  
- Project Skills = Domain learners that research, execute, and continuously improve
- Learning flows: User friction → Skill improvement → (if pattern) → Skill-creator improvement → (if process) → Mother Brain improvement

**Skill Composition Pattern:**

When to invoke other skills during execution:
- **Design/Visual tasks** → Invoke branding/design skills
- **Documentation needs** → Invoke documentation skills
- **Code quality** → Invoke linting/testing skills
- **Data modeling** → Invoke database/schema skills

How to invoke:
1. Detect the need (e.g., "I'm building a UI and need design guidance")
2. Check if relevant skill exists (search `.github/skills/` for matching domain)
3. Use `skill` tool to invoke: `skill brand-guidelines-builder` or `skill <skill-name>`
4. Collect output/guidance from invoked skill
5. Integrate into current execution
6. Continue with main task

Example flow:
```
windows-app-builder executing...
├─ Step 1-3: Gather context, plan architecture
├─ Step 4: Building UI...
│  ├─ Detect: Need visual design guidance
│  ├─ Check: brand-guidelines-builder skill exists
│  ├─ Invoke: skill brand-guidelines-builder
│  │  └─ (Brand skill wizard runs, provides color palette, typography, spacing)
│  ├─ Receive: Brand guidelines output
│  └─ Apply: Use guidelines in UI generation
└─ Step 5-6: Complete app with branded UI
```

**End-User Accessibility Principle:**
- **If skill creates applications**: Provide launchers, executables, or simple run scripts—not just source code
- **If skill creates documents**: Generate in commonly used formats (PDF, DOCX, HTML)
- **If skill creates tools**: Include README with one-line command to use it
- **Default assumption**: User wants to USE the output immediately, not configure or edit it

**Bad Example (technical focus):**
```
1. Gather Requirements
   - Ask: "What framework do you want to use?"
   - Ask: "What build tool?"
   - Ask: "What package manager?"
   ❌ Too technical, assumes user knows infrastructure
```

**Good Example (outcome focus):**
```
1. Gather Context via Wizard
   - Ask: "What problem does this app solve?"
   - Ask: "Who will use it and how often?"
   - Ask: "How do you want to launch it? (Desktop icon, command line, web browser)"
   ✅ Focuses on user needs, agent decides technical details
```

**Example wizard flow:**
```
📋 Skill Creation Wizard

Question 1: What problem are you trying to solve?
  > [User types: "Our API documentation is always out of sync with the actual code. Developers update endpoints but forget to update the docs."]

Question 2: How critical is this problem for your team?
  1. Blocks development - happens daily and causes confusion
  2. Slows us down - happens weekly, wastes time
  3. Minor annoyance - happens occasionally

Question 3: What would the ideal solution do for you?
  1. Automatically generate docs from code annotations
  2. Validate existing docs against live API and flag mismatches
  3. Both - generate docs AND validate them continuously

Question 4: Who will use this solution most?
  1. Developers writing the APIs
  2. Technical writers maintaining docs
  3. Both developers and writers

✅ Here's what I understand:

**Problem**: API documentation becomes outdated when code changes
**Impact**: Daily confusion and wasted time across team
**Solution**: Auto-generate and validate API docs from code
**Users**: Both developers and technical writers

**Proposed skill**: api-docs-sync
**Capabilities**:
  • Scan code for API endpoint definitions and annotations
  • Generate documentation in standard format (OpenAPI/Swagger)
  • Validate existing docs against actual API structure
  • Flag mismatches and suggest updates
  • Run as CI/CD check to prevent drift

Does this capture what you need?
  1. Yes, submit and create
  2. Refine the approach
  3. Start over
```

## Skill Composition (Cross-Skill Collaboration)

**Purpose**: Enable skills to invoke other skills for specialized expertise, creating a collaborative skill ecosystem.

**When to Use Skill Composition:**

A skill should invoke another skill when:
- It encounters a task outside its primary domain
- Another skill has specialized knowledge that would improve the result
- The task has multiple distinct phases requiring different expertise

**Common Collaboration Patterns:**

| Primary Skill | Could Invoke | For What |
|---------------|--------------|----------|
| windows-app-builder | brand-guidelines-builder | UI design, colors, typography |
| api-builder | documentation-skill | API reference docs |
| database-designer | data-validator | Schema validation |
| test-generator | code-analyzer | Complexity analysis |

**How to Implement in Created Skills:**

1. **Detection Phase** (during execution):
   ```markdown
   - Analyze current task and identify sub-domains
   - Check if task would benefit from specialized expertise
   - Search `.github/skills/` for relevant skills by domain/name
   ```

2. **Invocation**:
   ```markdown
   - Use `skill` tool: `skill <skill-name>`
   - The invoked skill runs its wizard to gather context
   - Collect output/guidance from invoked skill
   ```

3. **Integration**:
   ```markdown
   - Apply output from invoked skill to current task
   - Continue with main execution using enhanced knowledge
   ```

**Example Implementation in SKILL.md:**

```markdown
4. **Execute - Build Application**
   - Generate project structure
   - **Check for design enhancement**:
     - If creating UI components, check if brand-guidelines-builder skill exists
     - If exists: Invoke `skill brand-guidelines-builder`
     - Collect: Color palette, typography rules, spacing system
     - Apply: Use brand guidelines in generated UI code
   - Build remaining components
   - Compile and test
```

**Guidelines for Skill Composition:**

- ✅ **Optional, not required**: Skill should work standalone if invoked skill doesn't exist
- ✅ **Context passing**: Briefly explain to user why invoking another skill
- ✅ **Seamless integration**: Make the collaboration invisible to user if possible
- ✅ **Avoid circular dependencies**: Skill A shouldn't invoke Skill B if B invokes A
- ❌ **Don't over-compose**: Only invoke when genuinely adds value

**Detecting Available Skills:**

```markdown
Step: Check for complementary skills
- Use `glob` tool: pattern=".github/skills/*/SKILL.md"
- Parse skill names and descriptions
- Match against current needs (e.g., "design", "brand", "visual")
- If match found, consider invoking
```

## Example

**User request**: "Make a skill for formatting Markdown."

- Name: `markdown-formatter`
- Description: "Format markdown files with consistent headings, lists, and code blocks."
- Domain: `docs`

Create `.github/skills/markdown-formatter/SKILL.md` with:
- explicit formatting rules
- a before/after example
- validation checks (e.g. no malformed headings, consistent list indentation)
