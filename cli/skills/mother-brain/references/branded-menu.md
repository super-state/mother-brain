# Branded Menu Frame

Use this template for ALL menus and selections in Mother Brain.

## Theme: Clean, Simple with Brain Emoji

```
🧠 Welcome back to [Project Name]!

📍 Where You Left Off:
- Phase: [Current Phase Name]
- Last Task: [Task Number] - [Task Name] ([Status])
- Progress: [X] of [Y] tasks completed
- Skills Created: [Count]

What would you like to do?
```

## Theme Elements
- Header starts with 🧠 emoji followed by welcome message
- Use 📍 emoji for status section header
- Plain text content with bullet points for lists
- No ASCII art, no "Vision-Driven Development" tagline
- No markdown tables (hard to read in terminals)
- No horizontal rules or code fences around output

## Styling Rules
- Header format: 🧠 [Welcome/Status message]
- Use dash `-` for lists
- Use emoji markers for sections (📍, ✅, 🔧)
- Keep content simple and readable
- No ASCII box borders, no tables

## Example - Welcome Back Menu
```
🧠 Welcome back to Gaming Backlog Manager!

📍 Where You Left Off:
- Phase: Phase 1 - Core PWA Foundation
- Last Task: 003 - localStorage Data Layer (✅ Complete)
- Progress: 3 of 9 tasks completed
- Skills Created: 1

What would you like to do?
```

## Example - Selection Menu
```
🧠 Snakes and Ladders

What would you like to do?
```

Then use `ask_user` with choices immediately after the branded text.

**Important**: Do NOT wrap the menu output in triple-backtick code fences when displaying to user. Just output the text directly. Code fences cause terminal styling issues.
