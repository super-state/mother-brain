# Trigger Detection Research - GitHub Copilot CLI

## Overview
Research findings on how to implement intelligent intent detection for automatic skill triggering in GitHub Copilot CLI agents.

## Key Findings from Web Search (2026-02-03)

### 1. Prompt Engineering for Intent Detection

**Source**: [GitHub Copilot Specific Techniques - Prompt Library](https://parul-mahajan.github.io/Prompt-Library/BestPractices/PromptEngineeringBestPractices/GitHubCopilotSpecificTechniques/)

**Key Points**:
- Craft purposeful prompts with clear intent and behavior definitions
- Use markdown "persona" files to specify role, expected input/output
- Include "kill switch" phrases to automate workflows
- Iteratively refine prompts based on accuracy and consistency
- Provide input/output examples and constraints for reliability

**Application to Skill Triggers**:
- Define trigger phrases as "personas" for each skill
- Create clear examples of what SHOULD and SHOULD NOT trigger
- Iteratively test and refine trigger keywords based on real usage

### 2. CI/CD Integration Patterns

**Source**: [Injecting AI Agents into CI/CD](https://dev.to/vevarunsharma/injecting-ai-agents-into-cicd-using-github-copilot-cli-in-github-actions-for-smart-failures-58m8)

**Key Points**:
- Regular expressions or phrase matching transform NLP output into actionable triggers
- Search output for predefined phrases that act as fail switches
- Combine Copilot's analysis with traditional static analysis for validation
- Use "shift left" quality culture—catch issues early

**Application to Skill Triggers**:
- Use regex patterns for flexible trigger matching
- Combine keyword detection with context analysis
- Validate that detected intent matches user's actual goal
- Allow user to confirm/override automated triggering

### 3. Permission and Control Balance

**Source**: [Using GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli)

**Key Points**:
- Copilot CLI requests approval before executing code or modifying files
- Session-based or task-based approvals balance automation with control
- Always review proxy actions, especially destructive operations

**Application to Skill Triggers**:
- Auto-trigger should show brief confirmation before proceeding
- User can cancel within 2-3 seconds
- Sensitive skills (deletion, major changes) require explicit confirmation
- Log all auto-triggered actions for audit trail

### 4. Validation and Trust

**Source**: [Best Practices for GitHub Copilot](https://docs.github.com/en/copilot/get-started/best-practices)

**Key Points**:
- Treat Copilot outputs as suggestions, not final implementations
- Review, test, and validate before automating deployment
- Monitor output over time and adjust logic as needs evolve

**Application to Skill Triggers**:
- Track false positives/negatives in trigger detection
- Allow users to correct misdetections
- Learn from corrections to improve trigger patterns
- Maintain confidence threshold to prevent overly aggressive triggering

## Trigger Detection Algorithm Design

Based on research findings, here's the recommended approach:

### Phase 1: Preprocessing
```
1. Normalize input:
   - Convert to lowercase
   - Remove punctuation (except necessary characters)
   - Trim whitespace
   
2. Extract intent keywords:
   - Action verbs: create, build, make, start, format, fix, etc.
   - Domain nouns: project, app, skill, markdown, code, etc.
```

### Phase 2: Pattern Matching
```
1. Exact phrase match:
   - Check if user message contains exact trigger phrase
   - Example: "create project" matches "I want to create a project for my team"
   
2. Keyword combination match:
   - Check if message contains 2+ keywords from trigger
   - Example: "create" + "project" = high confidence
   
3. Semantic similarity:
   - Check for synonyms and related terms
   - "build" ≈ "create" ≈ "make" ≈ "develop"
```

### Phase 3: Confidence Scoring
```
Exact phrase match = 1.0
Keyword combination (2+) = 0.85
Keyword combination (1) + semantic = 0.70
Semantic similarity only = 0.50

Threshold for auto-trigger: 0.80
```

### Phase 4: Validation
```
1. Check for false positive indicators:
   - Question words: "what", "how", "why" → Don't trigger
   - Past tense: "I created" → Don't trigger (already done)
   - Hypothetical: "should I", "could I" → Confirm before trigger
   
2. Context analysis:
   - Is user mid-conversation? → Confirm
   - Is this first message? → Auto-trigger OK
   - Multiple skills match? → Show choices
```

## Implementation Checklist

### Skill Metadata Schema
- [ ] Add `triggers` field to skill YAML frontmatter
- [ ] Define at least 2-3 trigger phrases per skill
- [ ] Include variations (synonyms, different word orders)
- [ ] Document what should NOT trigger

### Detection System
- [ ] Build preprocessing pipeline (normalization)
- [ ] Implement pattern matching (exact, partial, semantic)
- [ ] Add confidence scoring
- [ ] Create false positive filters

### User Experience
- [ ] Show brief "Detected intent: [skill-name]" message
- [ ] Provide 2-3 second cancellation window
- [ ] Log all auto-triggered actions
- [ ] Allow feedback to improve detection

### Special Handling: Mother-Brain
- [ ] Add ASCII alien brain art to mother-brain SKILL.md
- [ ] Display art immediately when triggered
- [ ] Include "👽 Vision-Driven Development 👽" tagline
- [ ] Define project-related trigger phrases

## Testing Strategy

### Unit Tests
- Test exact phrase matching
- Test keyword combination detection
- Test false positive filters
- Test confidence scoring thresholds

### Integration Tests
- Test with real user messages (varied phrasings)
- Test multi-skill scenarios (which skill wins?)
- Test cancellation flow
- Test skill invocation after detection

### User Acceptance
- A/B test auto-trigger vs manual invocation
- Track user cancellation rate
- Measure false positive/negative rates
- Gather feedback on trigger phrase coverage

## Future Enhancements

1. **Machine Learning**: Train model on user corrections to improve detection
2. **Context Awareness**: Remember recent conversation topics
3. **Multi-Skill Orchestration**: Chain skills automatically when tasks require it
4. **Voice/Natural Language**: Expand beyond text to voice commands
5. **Customization**: Let users define personal trigger phrases
