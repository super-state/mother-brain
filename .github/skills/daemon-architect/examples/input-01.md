# Example: Module Creation Request

## Scenario
User asks: "I need to add a budget tracking module to the daemon."

## Skill Assessment
1. Check daemon-architect for module location → `daemon/src/budget/`
2. Check coding patterns → Module pattern with start/stop lifecycle
3. Check database schema → `budget_tracking` table exists
4. Check dependencies → `better-sqlite3` and `pino` already in stack

## Wizard Questions
None needed — daemon-architect provides all patterns. Agent creates module following established architecture.
