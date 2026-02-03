# Intent Detection Resources

## Natural Language Processing (NLP) for Intent Detection

### Keyword Matching Strategies
- **Exact Match**: Direct phrase matching ("create project" → mother-brain)
- **Partial Match**: Substring matching ("I want to create a project for...")
- **Semantic Match**: Synonym/related words ("build", "make", "start", "develop")

### Pattern Recognition Best Practices
- Use regular expressions for flexible matching
- Account for variations: "create a project", "creating project", "I want to create project"
- Case-insensitive matching
- Handle filler words: "I'd like to...", "Can you help me..."

## GitHub Copilot Intent Detection Research

Source: [Injecting AI Agents into CI/CD](https://dev.to/vevarunsharma/injecting-ai-agents-into-cicd-using-github-copilot-cli-in-github-actions-for-smart-failures-58m8)

### Key Insights:
- **Phrase-based automation triggers**: Parse natural language output for predefined phrases that act as switches
- **Iterative prompt refinement**: Test and refine trigger phrases based on accuracy
- **Session-based approvals**: Balance automation with user control
- **Combine with static analysis**: Verify intent before triggering actions

Source: [GitHub Copilot Specific Techniques](https://parul-mahajan.github.io/Prompt-Library/BestPractices/PromptEngineeringBestPractices/GitHubCopilotSpecificTechniques/)

### Prompt Engineering for Triggers:
- **Clear intent specification**: Define expected input patterns explicitly
- **Input/output examples**: Provide examples of valid trigger phrases
- **Constraint definition**: Specify what should NOT trigger

## ASCII Art Design Resources

### ASCII Art Generators
- **TAAG (Text to ASCII Art Generator)**: https://patorjk.com/software/taag/
  - Ideal for stylized text banners
  - Multiple font styles for "MOTHER BRAIN" logo
  
- **Emoji Combos Alien ASCII Art**: https://emojicombos.com/alien-ascii-art
  - Pre-made alien designs
  - UFO and space-themed art
  
- **Orbit2x ASCII Generator**: https://orbit2x.com/ascii-generator
  - Custom design tools
  - Export options for various formats

### Brain & Alien ASCII Motifs
- Brain shapes: Squiggles, wavy lines, logic gate symbols
- Alien heads: Classic emoticon style `(o)(o)` for eyes
- Combination design: Alien head with brain texture inside

## Trigger Detection Implementation

### Detection Algorithm
```
1. Normalize user input (lowercase, remove punctuation)
2. Check for exact phrase matches from skill metadata
3. If no exact match, check for partial matches (keywords)
4. If no partial match, check for semantic similarity
5. Return matched skill with confidence score
6. Only trigger if confidence > threshold (e.g., 0.8)
```

### Skill Metadata Format
```yaml
metadata:
  domain: meta
  triggers:
    - "create project"
    - "start project"
    - "build app"
  trigger_confidence: 0.85  # Optional: Override default threshold
```

### False Positive Prevention
- Require minimum 2 keywords from trigger phrase
- Exclude common conversation starters ("hi", "hello", "thanks")
- Blacklist ambiguous phrases ("what is", "how do I")
- Always allow user override/cancellation

## GitHub Actions Integration

If implementing as automated workflow:
- Use GitHub Actions to monitor issue/PR comments
- Parse comments for trigger phrases
- Automatically invoke skills via GitHub CLI
- Post results back to issue/PR

Reference: [Integrating Copilot with CI/CD](https://amplifilabs.com/post/integrating-github-copilot-with-ci-cd-pipelines-for-smarter-automation)

## User Experience Considerations

### When to Auto-Trigger:
✅ User starts message with action verb ("create", "build", "format")
✅ User explicitly states intent ("I want to...", "I need to...")
✅ Clear project/task keywords present

### When NOT to Auto-Trigger:
❌ User is asking questions ("how do I...", "what is...")
❌ User is in middle of another task
❌ Ambiguous context (multiple possible skills match)

### Branding Best Practices:
- Display ASCII art briefly (don't clutter terminal)
- Use color codes if terminal supports (ANSI codes)
- Keep art compact (10-15 lines max)
- Ensure art is monospace-font compatible
