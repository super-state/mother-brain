# Skill Trigger Detector - Example Output

## Skill Configuration

### Updated mother-brain SKILL.md Metadata
```yaml
---
name: mother-brain
description: Vision-driven development framework that creates roadmaps, identifies needed skills, and manages project execution.
license: MIT
metadata:
  domain: project-management
  stage: production
  triggers:
    - "create project"
    - "start project"
    - "build project"
    - "new project"
    - "make project"
    - "I want to create"
    - "I want to build"
allowed-tools: ask_user view grep glob web_search skill create edit powershell
---
```

## Detection Results

### Test 1: "I want to create a project"
```
✓ Intent detected: mother-brain (confidence: 100%)
→ Auto-triggering skill
```

### Test 2: "How do I create a project?"
```
✗ No auto-trigger: Message appears to be a question
→ Normal conversation mode
```

### Test 3: "Let's build an app for tracking workouts"
```
✓ Intent detected: mother-brain (confidence: 85%)
→ Auto-triggering skill
```

### Test 4: "I created a project yesterday"
```
✗ No auto-trigger: Past tense detected (already completed)
→ Normal conversation mode
```

## Mother-Brain Branding Display

When triggered, mother-brain displays:

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

Then proceeds with vision discovery wizard.

## User Experience Flow

1. **User enters message** (natural language)
2. **System detects intent** (< 100ms)
3. **ASCII art displayed** (if mother-brain)
4. **Skill invoked automatically** (seamless transition)
5. **Skill runs wizard** (gathers context)
6. **Skill executes** (creates output)

## Success Metrics

- **Accuracy**: 95%+ correct skill detection
- **False Positive Rate**: <5% incorrect triggers
- **User Satisfaction**: No manual /skill-name commands needed
- **Speed**: Detection in <100ms, imperceptible to user
