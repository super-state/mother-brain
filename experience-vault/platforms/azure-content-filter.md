# Azure OpenAI Content Filter

**Category**: APIs / Content Moderation  
**Platform**: Azure OpenAI (including GitHub Models API)  
**Severity**: High — causes silent failures in conversation systems

## The Gotcha

Azure OpenAI has an aggressive content management filter that can trigger false positives on innocuous messages. When triggered, it returns a `400` error with code `content_filter` and a `ResponsibleAIPolicyViolation` inner error.

**Common false positive triggers:**
- Imperative language ("do it now", "just do it", "get it done") → can trigger `self_harm: medium`
- Urgency expressions combined with conversation history
- The filter analyzes the FULL prompt (system + history + user message), so accumulated context can push it over the threshold

## The Error Response

```json
{
  "code": "content_filter",
  "status": 400,
  "innererror": {
    "code": "ResponsibleAIPolicyViolation",
    "content_filter_result": {
      "self_harm": { "filtered": true, "severity": "medium" }
    }
  }
}
```

## Solution

Always wrap LLM calls in try/catch and handle `content_filter` errors gracefully:

```typescript
try {
  const response = await client.chat.completions.create({ ... });
  reply = response.choices[0]?.message?.content;
} catch (error) {
  if (error.code === 'content_filter') {
    // Graceful fallback — don't expose the error to users
    reply = "Let me think about that differently...";
  } else {
    throw error;
  }
}
```

**NEVER** show "sorry I had trouble processing that" — users think the system is broken.

## Prevention Tips

- Keep system prompts neutral and professional
- Avoid words like "harm", "hurt", "damage", "kill", "attack" in system prompts
- The filter is more sensitive to system prompt content than user messages
- Shorter conversation context = lower chance of false positives

## Discovered

2025-02-24 — Mother Brain Daemon conversation testing via GitHub Models API. User said "do it now" and the filter flagged `self_harm: medium`.
