# File Structure Created by Mother Brain

```
project-root/
├── .mother-brain/                    # Mother Brain isolated directory (project docs only)
│   ├── docs/
│   │   ├── vision.md                 # Project vision (what, who, when, WHY)
│   │   ├── roadmap.md                # Phased execution plan
│   │   ├── learning-log.md           # Self-improvement tracking (PRESERVED on eject)
│   │   └── tasks/
│   │       ├── 001-task-name.md      # Individual task documents
│   │       ├── 002-task-name.md
│   │       └── ...
│   ├── project-brain.md              # Project-specific learnings (managed by Child Brain)
│   ├── session-state.json            # Current session state (tracks skillsCreated)
│   └── README.md                     # Mother Brain directory info
├── .github/
│   └── skills/                       # ALL skills (framework + project-specific)
│       ├── mother-brain/             # Core framework (never delete)
│       ├── child-brain/              # Core framework - learning orchestrator (never delete)
│       ├── skill-creator/            # Core framework (never delete)
│       ├── elder-brain/              # Core framework - knowledge vault (never delete)
│       ├── [project-skill-1]/        # Project-specific (tracked in session-state.json)
│       └── [project-skill-2]/        # Project-specific (tracked in session-state.json)
├── .agents/
│   └── skills/                       # Symlinks to .github/skills/ (Codex CLI compatibility)
│       ├── mother-brain/ → ../../.github/skills/mother-brain/
│       ├── child-brain/  → ../../.github/skills/child-brain/
│       ├── skill-creator/ → ../../.github/skills/skill-creator/
│       └── elder-brain/  → ../../.github/skills/elder-brain/
├── experience-vault/                 # Cross-project domain knowledge (managed by Elder Brain)
│   ├── README.md
│   ├── platforms/                    # Platform-specific gotchas
│   ├── ui/                           # UI/UX patterns and gotchas
│   ├── security/                     # Auth, data exposure patterns
│   ├── deployment/                   # Deployment gotchas per platform
│   └── apis/                         # API integration patterns
├── src/                              # Source code (standard structure)
├── tests/                            # Tests (standard structure)
├── README.md                         # Project overview
└── [other standard project files]
```

## Key Principles
- **Dual CLI Compatibility**: Skills live in `.github/skills/` (GitHub Copilot CLI, source of truth) and are symlinked to `.agents/skills/` (Codex CLI). Relative symlinks survive git clone. Falls back to copy if symlinks fail.
- **Skill Tracking**: `session-state.json` tracks which skills are project-specific via `skillsCreated` array
- **Easy Ejection**: Delete skills listed in `skillsCreated`, keep core framework skills
- **Isolated Docs**: Project documentation in `.mother-brain/docs/` (separate from project code)
- **Learning Preservation**: `learning-log.md` is preserved on eject for continuous improvement
- **Learning Separation**: Project Brain stores project-specific learnings; Mother Brain stores only meta-level process improvements
- **Elder Brain**: `experience-vault/` stores cross-project domain knowledge, managed by Elder Brain skill
