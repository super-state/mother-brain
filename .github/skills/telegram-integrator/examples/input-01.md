# Example: Command Implementation Request

## Scenario
User asks: "Add a /status command to the Telegram bot."

## Skill Assessment
1. Check telegram-integrator for command specification → `/status` spec found
2. Check message format → Status format template available
3. Check patterns → Composer pattern, MessageBuilder, MarkdownV2
4. Check auth → Middleware already handles chat ID filtering
