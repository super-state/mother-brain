---
name: skill-trigger-detector
description: Automatically detect user intent and trigger appropriate skills without menu navigation.
license: MIT
metadata:
  domain: automation
  stage: production
allowed-tools: ask_user view grep glob skill powershell
---

# Skill Trigger Detector

Automatically detects when a user's message indicates they want to use a specific skill, then triggers that skill without requiring explicit menu navigation.

## Purpose

Enable natural, conversational interaction with skills by detecting intent from user messages and automatically invoking the appropriate skill. Special handling for mother-brain with ASCII branding.

## Operating Principles

- **Intent detection**: Analyze user messages for keywords and patterns that match skill capabilities
- **Automatic invocation**: Trigger skills seamlessly when intent is clear
- **Skill metadata**: Read trigger phrases from each skill's YAML frontmatter
- **Mother-brain branding**: Display ASCII alien brain art when mother-brain is triggered
- **Fallback gracefully**: If no clear intent, proceed with normal conversation
- **No false positives**: Only trigger when confidence is high

## Steps

1. **Gather Context via Wizard**
   - Use `ask_user` to understand what the user wants to configure
   - Ask: "What would you like to set up?"
     - Add trigger phrases to mother-brain skill
     - View all skills and their current triggers
     - Test trigger detection with sample messages
   
2. **Execute Based on Choice**
   
   **If adding triggers to mother-brain:**
   - Display current mother-brain triggers (if any)
   - Ask user: "What keywords or phrases should trigger mother-brain?"
   - Update mother-brain SKILL.md metadata section with triggers
   - Add ASCII alien brain art to mother-brain's branding
   
   **If viewing skills:**
   - Scan all skills in `.github/skills/`
   - Extract trigger phrases from metadata
   - Display skill names with their triggers
   
   **If testing triggers:**
   - Ask for sample user message
   - Run detection logic
   - Show which skill would be triggered (if any)

3. **Update Mother-Brain Branding**
   - Add ASCII alien brain art at top of mother-brain SKILL.md
   - Configure mother-brain to display branding on activation
   - Ensure branding appears before wizard starts

4. **Configure Trigger Detection Logic**
   - Create detection rules for mother-brain keywords:
     - "create project", "start project", "build project"
     - "new app", "make an app"
     - "I want to create", "I want to build"
   - Skills can define custom triggers in metadata:
     ```yaml
     metadata:
       triggers:
         - "format markdown"
         - "fix markdown"
     ```
   - Detection priority: Exact match > Partial match > Semantic match

5. **Validate**
   - Test trigger detection with various phrasings
   - Ensure mother-brain ASCII art displays correctly
   - Verify no false positives on unrelated messages
   - Confirm skill invocation works seamlessly

## Mother-Brain ASCII Art

```
    ___________________
   /                   \
  /  ╔═══════════════╗  \
 |   ║  M O T H E R  ║   |
 |   ║   B R A I N   ║   |
  \  ╚═══════════════╝  /
   \___________________/
       ||         ||
      //\\       //\\
     //  \\     //  \\
    //====\\   //====\\
   
   👽 Vision-Driven Development 👽
```

## Example Trigger Phrases

**Mother-Brain:**
- "I want to create a project"
- "Start a new project"
- "Build an application"
- "Make something new"

**Other Skills (examples):**
- "Format my markdown" → markdown-formatter
- "Create a skill" → skill-creator
- "Fix this bug" → debugger-helper

## Notes

- Trigger detection runs BEFORE normal processing if user message starts with clear intent keyword
- Skills without defined triggers won't auto-activate
- User can always explicitly invoke skills with `/skill-name` or via menu
- Mother-brain is the primary beneficiary—other skills can opt-in via metadata
