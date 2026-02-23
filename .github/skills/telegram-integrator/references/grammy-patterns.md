# grammy Best Practices (2025)

## TypeScript Setup
- grammy is TypeScript-first — full type safety out of the box
- Use `Bot<MyContext>` with custom context types for strong typing
- Compose handlers using `Composer` class for modularity

## Long Polling vs Webhooks
- **Long polling**: Simpler, perfect for daemons on Pi (no public URL needed)
- **Webhooks**: Better for cloud deployments with high traffic
- **Recommendation**: Use long polling for the daemon. No HTTPS certificate or domain needed.

## Graceful Shutdown
```typescript
const bot = new Bot(token);

// Handle shutdown signals
process.on('SIGTERM', () => bot.stop());
process.on('SIGINT', () => bot.stop());

// Start with graceful shutdown support
await bot.start({
  onStart: () => console.log('Bot started'),
  drop_pending_updates: true, // Don't process old messages on restart
});
```

## Error Handling
```typescript
bot.catch((err) => {
  const ctx = err.ctx;
  logger.error({ error: err.error, update: ctx.update }, 'Bot error');
  // Don't crash — log and continue
});
```

## Message Formatting Tips
- Always escape MarkdownV2 special characters: `_*[]()~>#+\-=|{}.!`
- Use `parse_mode: 'MarkdownV2'` in send options
- Long messages: Split at 4096 chars, send as multiple messages
- Use inline keyboards for interactive controls (pause/resume buttons)
