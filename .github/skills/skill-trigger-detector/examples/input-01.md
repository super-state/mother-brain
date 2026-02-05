# Skill Trigger Detector - Example Input

## User Message
```
User: "I want to create a project for a music streaming app"
```

## Wizard Interaction

**Step 1: Detect Intent**
```
✓ Intent detected: mother-brain (confidence: 95%)

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

Triggering skill: /skill mother-brain
```

**Step 2: Mother-Brain Takes Over**
```
🎯 Welcome to Mother Brain!

I detected you want to create a project. Let me help you shape your vision...

📋 Vision Discovery Wizard - Question 1

What problem does this project solve?
```

---

## Alternative User Messages

### Example 2: Explicit Skill Request
```
User: "I want to format my markdown files"

✓ Intent detected: markdown-formatter (confidence: 100%)
Triggering skill: /skill markdown-formatter
```

### Example 3: Ambiguous Intent
```
User: "How do I create a project?"

No auto-trigger: Message appears to be a question or greeting
Proceeding with normal conversation.
```

### Example 4: Multiple Keywords
```
User: "Can you help me build and deploy a new app?"

✓ Intent detected: mother-brain (confidence: 85%)
[ASCII art displayed]
Triggering skill: /skill mother-brain
```

### Example 5: No Clear Intent
```
User: "What's the weather like today?"

No skill intent detected. Proceeding with normal conversation.
```
