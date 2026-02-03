# LetsGO - Skills Framework

A meta-framework for GitHub Copilot CLI that enables vision-driven development through reusable skills and project management.

## What's This?

This repository contains a skill-based development framework with three core components:

### 🧠 Mother Brain
**The Vision-Driven Project Framework**
- Guides users from vision to execution
- Auto-identifies and creates needed skills
- Generates roadmaps and manages tasks
- Maintains project continuity across sessions

**Use:** Invoke `mother-brain` skill to start or continue a project

### 🎯 Skill Creator
**The Meta-Skill for Creating Skills**
- Interactive wizard for creating new skills
- Updates and heals existing skills
- Validates skill structure and execution
- Self-improving through feedback

**Use:** Invoke `skill-creator` to manage skills

### 📚 Skills Library
**Reusable, Domain-Specific Skills**

Current skills:
- `mother-brain` - Vision-driven project framework
- `skill-creator` - Create and manage skills
- `game-backlog-builder` - Build web apps for game tracking

## Quick Start

### Using Mother Brain (Recommended for New Projects)
Mother Brain will:
1. Ask about your vision and goals (WHY)
2. Identify what skills you need
3. Create those skills automatically
4. Generate a roadmap
5. Guide you through execution

### Using Skill Creator
Use skill-creator to:
- Create new skills
- Update existing skills
- Heal broken skills
- View all skills
- Delete skills

## Project Structure

```
.github/
  └── skills/                  # All skills live here
      ├── mother-brain/        # Vision-driven framework
      ├── skill-creator/       # Meta-skill for skills
      └── game-backlog-builder/ # Example skill
docs/
  └── skill-schema.md          # Skill structure documentation
.gitignore                     # Git configuration
README.md                      # This file
```

## How Skills Work

Each skill is a self-contained agent that:
- Has a SKILL.md with instructions
- Runs a wizard to gather context
- Executes based on gathered information
- Tests and validates output
- Can invoke other skills

## Philosophy

**Vision First**: Always start with WHY, not HOW  
**Skill Automation**: Create skills for repetitive patterns  
**User Validation**: Confirm work meets expectations  
**Self-Improvement**: Learn from mistakes and feedback  
**Best Practices**: Use standard project structures

## Examples

### Starting a Music Marketing SaaS
```
User: I want to build a music marketing SaaS platform

Mother Brain:
- Runs vision discovery (8 questions)
- Identifies needed skills (Spotify API, auth, email)
- Creates those skills automatically
- Generates 3-phase roadmap
- Starts executing tasks
```

### Creating a Custom Skill
```
User: I need a skill for API integration

Skill Creator:
- Asks about the problem
- Determines skill structure
- Creates SKILL.md with wizard
- Generates examples
- Adds to skills library
```

## Key Features

✅ **Vision-driven development** - Start with problems, not solutions  
✅ **Automatic skill generation** - Identifies patterns and creates skills  
✅ **Phased execution** - Breaks down into manageable tasks  
✅ **Session continuity** - Pick up where you left off  
✅ **User validation** - Always confirms work quality  
✅ **Self-learning** - Improves from feedback

## For Developers

### Creating a New Skill
1. Invoke `skill-creator`
2. Answer wizard questions
3. Skill automatically created in `.github/skills/`

### Skill Requirements
- YAML frontmatter with metadata
- Step 1 must be a wizard for gathering context
- Must test output before marking complete
- Examples showing input/output
- References with relevant documentation

### Best Practices
- Skills should be domain-specific and reusable
- Always ask "WHY" before "HOW"
- Test and validate all output
- Document decisions and rationale
- Use standard project structures

## License

MIT

## Contributing

Skills are self-documenting and self-creating. Use `skill-creator` to add new skills to the framework.

---

**Built with GitHub Copilot CLI**

**Pure Skills, No Dependencies** - This framework requires only GitHub Copilot CLI. No Node.js, no npm, no build tools.

