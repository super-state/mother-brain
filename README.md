# 🧠 Mother Brain

> **For humans:** Mother Brain learns your vision and ships your project autonomously. It gets better with every interaction - by the end, it knows what you want better than you do. Less prompting. More shipping.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/mother-brain.svg)](https://www.npmjs.com/package/mother-brain)
[![Version](https://img.shields.io/badge/version-0.4.2-blue)](https://github.com/super-state/mother-brain/releases)

**Open Source AI Project Management Framework for GitHub Copilot CLI**

Transform your vision into reality with Mother Brain—an intelligent meta-framework that guides AI assistants through vision-driven project execution. Built for developers who want to ship faster with AI-powered automation, research-driven roadmaps, and automatic skill generation.

**Version**: 0.4.2 | **License**: MIT | **Status**: Production Ready

## Why Mother Brain?

- **Vision-Driven Development**: Start with WHY, not just WHAT
- **Automatic Skill Generation**: Creates specialized agents for your project patterns
- **MVP-First Roadmaps**: Research-driven phasing that delivers value fast
- **Self-Learning**: Improves from every project it manages
- **Zero Token Waste**: Efficient execution with intelligent context management

## Quick Start

<img width="1057" height="267" alt="image" src="https://github.com/user-attachments/assets/02119e06-67f8-42b7-9c82-f9c94050243f" />

### 1. Install Mother Brain in Your Project

```bash
# In your project directory
npx -y mother-brain init
```

This adds the Mother Brain skills to your project's `.github/skills/` folder.

### 2. Start Mother Brain with GitHub Copilot CLI

```bash
# Using GitHub Copilot CLI
ghcs "/mother-brain"
```

### 3. Follow the Wizard

Mother Brain will guide you through:
- **Vision Discovery**: 8-12 questions to clarify your project's purpose
- **Roadmap Generation**: Research-driven phased plan
- **Skill Creation**: Automated patterns for your project type
- **Task Execution**: Step-by-step implementation

## CLI Commands

```bash
npx -y mother-brain init       # Add Mother Brain to your project
npx -y mother-brain update     # Update to the latest version
npx -y mother-brain status     # Check installed version
npx -y mother-brain analyze    # Analyze skills and suggest improvements
npx -y mother-brain upgrade    # Apply improvements to skills
npx -y mother-brain uninstall  # Remove Mother Brain from project
npx -y mother-brain docs       # Open documentation
npx -y mother-brain quickstart # Show quick start guide
```

## Features

- 🎯 **Vision Discovery Wizard**: 8-12 questions to clarify your project's purpose
- 📋 **Research-Driven Roadmaps**: Automatically researches best practices for your project type
- 🛠️ **Dynamic Skill Creation**: Identifies repetitive patterns and generates specialized skills
- ✅ **Task Management**: Breaks down phases into actionable, trackable tasks
- 🔄 **Session Continuity**: Pick up exactly where you left off
- 🧠 **Self-Improvement**: Learns from feedback and updates itself
- 🚀 **MVP Focus**: Delivers core value first, iterates based on real feedback

## What Makes It Different?

Mother Brain isn't just a tool—it's a **thinking partner** for your AI development workflow:

- **Product-First**: Focuses on outcomes and user value, not just features
- **Research-Driven**: Automatically researches best practices for your project type
- **Adaptive**: Roadmaps evolve based on learnings, not rigid plans
- **Self-Improving**: Updates itself when issues are found—learns from every project

## Project Structure

After running `npx -y mother-brain init`, your project will have:

```
your-project/
├── .github/skills/         # Mother Brain skills
│   ├── mother-brain/       # Core orchestrator
│   ├── child-brain/        # Learning & feedback
│   └── skill-creator/      # Generates new skills
├── .mother-brain/          # Project docs (created when you use it)
│   ├── docs/
│   │   ├── vision.md       # Project vision
│   │   ├── roadmap.md      # Phased execution plan
│   │   └── tasks/          # Individual task documents
│   ├── version.json        # Installed version tracking
│   └── session-state.json  # Session continuity
└── ... your project files
```

## Use Cases

- **New Projects**: Start with vision, get a complete roadmap and skill library
- **Existing Projects**: Import your vision, identify patterns, create skills
- **Learning AI Development**: See best practices in action
- **Team Collaboration**: Share vision and roadmap documents

## Requirements

- [GitHub Copilot CLI](https://docs.github.com/en/copilot/github-copilot-in-the-cli) installed and configured
- Node.js 18+ (for npm/npx)
- Git for version control

## Updating Mother Brain

When a new version is available, Mother Brain will notify you on startup. Update with:

```bash
npx -y mother-brain update
```

## Removing Mother Brain

To remove Mother Brain from your project:

```bash
npx -y mother-brain uninstall        # Remove core skills, keep docs
npx -y mother-brain uninstall --all  # Remove everything including docs
```

## License

MIT - See LICENSE file for details

## Community

- Report issues or suggest improvements via GitHub Issues
- Share your projects built with Mother Brain

## Contributing

We welcome contributions of all kinds. Please read:
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Frequently Asked Questions

**Q: What problem does Mother Brain solve?**  
A: Mother Brain eliminates wasted tokens and confusion in AI-driven development by providing structured workflows—from vision discovery to MVP delivery. It automates repetitive patterns through skill generation and uses research-backed best practices for every project type.

**Q: Is this only for GitHub Copilot CLI?**  
A: Currently yes. Mother Brain is optimized for GitHub Copilot CLI's skill system, but the framework principles (vision-driven development, skill automation, MVP-first roadmaps) apply to any AI coding assistant.

**Q: How is this different from traditional project management tools?**  
A: Mother Brain is built specifically for AI-driven development. Unlike traditional PM tools, it:
- Automatically researches best practices for your project type
- Generates specialized skills for repetitive patterns
- Learns from every project and improves itself
- Focuses on outcomes (vision) rather than just tasks

**Q: Do I need to know how to code to use Mother Brain?**  
A: Yes, Mother Brain is designed for developers building software projects with AI assistance. You'll need GitHub Copilot CLI installed and basic Git knowledge.

**Q: Can I use Mother Brain for existing projects?**  
A: Absolutely! You can import your existing vision/goals, and Mother Brain will help identify patterns, create skills, and generate a phased roadmap to guide continued development.

**Q: How does the self-learning feature work?**  
A: When issues occur or improvements are suggested, Mother Brain can update its own SKILL.md file to prevent similar issues in future projects. It learns from real-world feedback and compounds knowledge across all projects.

**Q: Is Mother Brain free to use?**  
A: Yes! Mother Brain is open source under the MIT License. You're free to use, modify, and distribute it.

## Comparison with Alternatives

| Feature | Mother Brain | Traditional PM Tools | AI Coding Assistants Alone |
|---------|--------------|---------------------|---------------------------|
| Vision Discovery | ✅ Built-in wizard | ❌ Manual | ❌ Not included |
| Research-Driven Roadmaps | ✅ Automatic | ❌ Manual | ❌ Not included |
| Skill Automation | ✅ Auto-generates | ❌ None | ⚠️ Manual prompt eng. |
| Self-Learning | ✅ Improves itself | ❌ Static | ❌ Stateless |
| Session Continuity | ✅ Resumes progress | ⚠️ Manual tracking | ❌ No memory |
| MVP-First Focus | ✅ Research-backed | ⚠️ Varies | ❌ Not guided |

## Roadmap & Changelog

See `.github/skills/mother-brain/SKILL.md` for the complete framework documentation and capabilities.

## Author & Maintainers

**Created by**: Mother Brain Project Contributors  
**Maintained by**: Open Source Community  
**First Released**: February 2026  

## References & Learn More

- [GitHub Copilot CLI Documentation](https://docs.github.com/en/copilot/github-copilot-in-the-cli)
- [Open Source Project Management Best Practices](https://opensource.guide/)
- [Vision-Driven Development Principles](https://en.wikipedia.org/wiki/Vision_document)

## Project Status

Mother Brain is **production-ready** and actively maintained.

