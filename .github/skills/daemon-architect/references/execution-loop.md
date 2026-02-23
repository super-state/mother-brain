# Daemon Module Patterns

## The Execution Loop

The daemon's core loop runs during active hours:

```
┌─────────────────────────────────────────┐
│            DAEMON HEARTBEAT             │
│                                         │
│  1. Check budget remaining              │
│     └─ If exceeded → stop, notify       │
│                                         │
│  2. Read roadmap.md (file read, $0)     │
│     └─ Parse outcomes and tasks         │
│                                         │
│  3. Pick next task                      │
│     └─ Priority: current outcome first  │
│                                         │
│  4. Load skill for task                 │
│     └─ Read SKILL.md (~2,000 tokens)    │
│                                         │
│  5. Build minimal context               │
│     └─ Skill + task + 2-3 files         │
│     └─ Target: ~4,700 tokens            │
│                                         │
│  6. Call cloud LLM API                  │
│     └─ Single request, tool use         │
│     └─ Track tokens + cost              │
│                                         │
│  7. Apply changes                       │
│     └─ Write files from LLM response    │
│                                         │
│  8. Verify (build → test gates)         │
│     └─ If fail → revert, log, move on   │
│                                         │
│  9. Commit verified changes             │
│     └─ One commit per task              │
│                                         │
│ 10. Update roadmap progress             │
│     └─ Mark task complete               │
│                                         │
│ 11. Notify via Telegram                 │
│     └─ Brief: "✅ Task X complete"      │
│                                         │
│ 12. Loop to step 1                      │
└─────────────────────────────────────────┘
```

## Key Principle: Zero-Cost Idle

Steps 1-3 use ZERO LLM tokens:
- Budget check = SQLite query
- Roadmap read = file system read
- Task picking = deterministic logic (next unchecked task)

LLM is ONLY called at step 6. Everything else is free.

## Confidence Classification

After verification, classify result:
- **HIGH** — Build passes, tests pass → auto-commit
- **MEDIUM** — Build passes, no tests available → commit to branch, flag for review
- **FAILED** — Build fails → revert, log, move to next task
