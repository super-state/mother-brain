# Telegram Integrator — Resources

## Framework
- **grammy**: https://grammy.dev/ — Official docs and guide
- **grammy GitHub**: https://github.com/grammyjs/grammY — Source and issues
- **grammy plugins**: https://grammy.dev/plugins/ — Rate limiter, menu, session, etc.

## Key grammy Plugins
- **@grammyjs/runner**: For long-polling with graceful shutdown
- **@grammyjs/ratelimiter**: Respect Telegram's rate limits
- **@grammyjs/parse-mode**: Easier MarkdownV2 formatting

## Telegram Bot API
- **Bot API docs**: https://core.telegram.org/bots/api
- **MarkdownV2 formatting**: https://core.telegram.org/bots/api#markdownv2-style
- **Rate limits**: ~30 messages/second globally, 1 message/second per chat
- **Message length**: Max 4096 characters per message

## Telegram Bot Setup
1. Message @BotFather on Telegram
2. Send `/newbot` and follow prompts
3. Save the bot token (keep secret!)
4. Get your chat ID: message the bot, then check `https://api.telegram.org/bot<token>/getUpdates`
5. Store token and chat ID in daemon config

## Security Notes
- Never commit bot tokens to git
- Only respond to configured chat ID (auth middleware)
- Bot tokens can be revoked via @BotFather if compromised
