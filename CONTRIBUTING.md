# Contributing to Mother Brain

Thank you for your interest in contributing to Mother Brain! 🧠 We're building the future of AI-driven project management together, and your help makes that possible.

This document provides guidelines for contributing to Mother Brain. Whether you're fixing a typo, reporting a bug, or proposing a major feature, we appreciate your efforts!

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Contributing to Mother Brain Core](#contributing-to-mother-brain-core)
- [Creating New Skills](#creating-new-skills)
- [Improving Documentation](#improving-documentation)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

This project adheres to a Code of Conduct (see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)). By participating, you're expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

There are many ways to contribute to Mother Brain:

- 🐛 **Report bugs** - Help us identify and fix issues
- 💡 **Suggest features** - Share ideas for improvements
- 🧠 **Improve Mother Brain** - Enhance the core framework
- 🛠️ **Create skills** - Build new specialized agents for common patterns
- 📝 **Improve docs** - Make Mother Brain easier to understand
- 🍴 **Share your projects** - Show what you've built with Mother Brain

## Reporting Bugs

Found a bug? Help us fix it!

**Before submitting a bug report:**
- Check the [existing issues](https://github.com/super-state/mother-brain/issues) to avoid duplicates
- Try to isolate the problem (which step/skill causes it?)

**When submitting a bug report, include:**
1. **Clear description** - What happened vs what you expected
2. **Steps to reproduce** - Exact steps that trigger the bug
3. **Environment**:
   - Operating system (Windows/Mac/Linux)
   - GitHub Copilot CLI version
   - Mother Brain version (commit SHA if using latest)
4. **Error messages** - Copy the full error output
5. **Screenshots** - If relevant (especially for visual issues)

**Example Bug Report:**
```markdown
## Bug: Vision Discovery Wizard Crashes on Question 5

**Expected**: Wizard should continue to question 6
**Actual**: Session ends with "undefined is not a function" error

**Steps to Reproduce**:
1. Invoke mother-brain skill
2. Start vision discovery
3. Answer questions 1-4 normally
4. On question 5, type freeform answer > 200 characters
5. Error occurs

**Environment**:
- OS: Windows 11
- Copilot CLI: v1.2.0
- Mother Brain: commit abc123f

**Error Output**:
```
TypeError: undefined is not a function at step 3.5...
```
```

## Suggesting Features

Have an idea to make Mother Brain better?

**Before suggesting a feature:**
- Check [existing issues](https://github.com/super-state/mother-brain/issues) for similar requests
- Review the [project vision](docs/quick-start.md) to ensure alignment

**When suggesting a feature, include:**
1. **Problem statement** - What pain point does this solve?
2. **Proposed solution** - How would this feature work?
3. **Alternatives considered** - Other approaches you thought about
4. **Use case** - Real-world scenario where this helps
5. **Impact** - Who benefits? How much value does it add?

**Feature Request Template:**
```markdown
## Feature: Auto-detect Project Type from Existing Files

**Problem**: Users with existing projects have to manually describe their project type during vision discovery.

**Solution**: Scan existing files (package.json, requirements.txt, etc.) and auto-suggest project type.

**Alternatives**:
- Ask user to specify type manually (current approach)
- Skip project type entirely (less accurate recommendations)

**Use Case**: Developer with existing React app wants Mother Brain to help plan next phase. Auto-detection saves time and improves accuracy.

**Impact**: All users with existing codebases (estimated 30-40% of users)
```

## Contributing to Mother Brain Core

Want to improve the framework itself? Here's how:

### Types of Core Contributions

1. **Bug Fixes** - Fix issues in existing Mother Brain logic
2. **Performance Improvements** - Optimize execution speed or token usage
3. **New Steps** - Add new phases to the Mother Brain workflow
4. **Operating Principles** - Suggest improvements to framework design

### Mother Brain Self-Improvement Flow

Mother Brain has a **self-improvement feature** that allows it to update its own SKILL.md:

1. Use Mother Brain's "Update Mother Brain" menu option
2. Describe the issue or improvement
3. Mother Brain will propose changes to its SKILL.md
4. Review and approve changes
5. Submit a PR with the updated SKILL.md

**This is the preferred way to contribute core improvements!**

### Manual Core Contributions

If you prefer to edit directly:

1. Read `.github/skills/mother-brain/SKILL.md` thoroughly
2. Identify which step or principle to modify
3. Make surgical changes (minimal modifications)
4. Test with a real project to validate
5. Submit a PR with:
   - Description of what changed and why
   - Before/after comparison
   - Test results showing improvement

## Creating New Skills

Skills are specialized agents that automate repetitive patterns. Creating skills is one of the most valuable contributions!

### When to Create a Skill

Create a skill when you notice:
- A pattern you've done 3+ times across different projects
- Complex wizard-style interactions that require multiple questions
- Domain-specific knowledge that can be reused (e.g., "database-schema-generator")

### How to Create a Skill

**Option 1: Use skill-creator (Recommended)**
1. Invoke mother-brain
2. Select "Create new skill" from menu
3. Use skill-creator's wizard to generate SKILL.md
4. Test the skill on a real project
5. Submit a PR with your new skill

**Option 2: Manual Creation**
1. Copy `.github/skills/skill-creator/SKILL.md` as a template
2. Fill in skill-specific sections
3. Add examples in `examples/` directory
4. Add references in `references/` directory
5. Test thoroughly
6. Submit a PR

### Skill Quality Checklist

Before submitting a skill PR, ensure:
- [ ] SKILL.md has all required sections
- [ ] At least 2 examples provided
- [ ] References section includes external sources
- [ ] Skill has been tested on a real project
- [ ] Skill follows Mother Brain operating principles
- [ ] Skill uses `ask_user` for decisions (wizard pattern)
- [ ] README in skill directory explains what it does

## Improving Documentation

Documentation improvements are always welcome!

### Types of Documentation Contributions

- Fix typos or grammatical errors
- Clarify confusing explanations
- Add examples or use cases
- Update outdated information
- Translate to other languages (future)

### Where Documentation Lives

- `README.md` - Project overview (you are here)
- `.github/skills/mother-brain/SKILL.md` - Core framework logic
- `.github/skills/[skill-name]/SKILL.md` - Individual skill docs
- `docs/` - Project documentation

### Documentation Style Guide

- **Be concise** - Respect readers' time
- **Be clear** - Avoid jargon or explain it
- **Be helpful** - Focus on solving problems
- **Use examples** - Show, don't just tell
- **Test your changes** - Make sure examples actually work

## Development Setup

Mother Brain runs within GitHub Copilot CLI, so development is unique:

### Prerequisites

- [GitHub Copilot CLI](https://docs.github.com/en/copilot/github-copilot-in-the-cli) installed and configured
- Git for version control
- Basic understanding of:
  - Markdown (for SKILL.md files)
  - GitHub Copilot skill system

### Local Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/super-state/mother-brain.git
cd mother-brain

# 3. Add upstream remote
git remote add upstream https://github.com/super-state/mother-brain.git

# 4. Test Mother Brain works
gh copilot explain "Use the mother-brain skill"
```

### Testing Changes

Mother Brain is **self-testing**:
1. Make your changes to SKILL.md or skill files
2. Invoke mother-brain on a test project
3. Verify your changes work as expected
4. Use Mother Brain's self-learning feature to validate improvements

**Example Test Flow:**
```bash
# Create a test directory
mkdir test-project
cd test-project

# Invoke Mother Brain with your changes
gh copilot explain "Use the mother-brain skill to start a test project"

# Go through the flow and verify your changes work
```

## Pull Request Process

Ready to submit your contribution?

### Before Submitting

- [ ] Test your changes on a real project
- [ ] Update relevant documentation
- [ ] Follow the style guide (minimal, surgical changes)
- [ ] Commit messages are clear and descriptive

### Commit Message Format

Use clear, descriptive commit messages:

**Good:**
```
Fix vision discovery crash on long freeform answers
Add skill: database-schema-generator
Update CONTRIBUTING.md with skill creation guide
```

**Bad:**
```
fix bug
update stuff
changes
```

### Creating a Pull Request

1. **Create a branch** - Use descriptive names
   ```bash
   git checkout -b fix/vision-discovery-crash
   # or
   git checkout -b feature/database-skill
   ```

2. **Make your changes** - Keep commits atomic and logical

3. **Push to your fork**
   ```bash
   git push origin fix/vision-discovery-crash
   ```

4. **Open a PR** on GitHub with:
   - **Title**: Clear, concise description
   - **Description**:
     - What problem does this solve?
     - How does it solve it?
     - How did you test it?
     - Screenshots (if relevant)
   - **Link related issues** (e.g., "Fixes #123")

### PR Review Process

1. **Automated checks** - CI may run basic validation (future)
2. **Maintainer review** - We'll review your PR within 7 days
3. **Feedback** - We may request changes or ask questions
4. **Merge** - Once approved, we'll merge your PR!

### After Your PR is Merged

- Your contribution will be included in the next release
- You'll be credited as a contributor
- Consider sharing your experience!

## Community

### Getting Help

- **Issues** - Ask questions in [GitHub Issues](https://github.com/super-state/mother-brain/issues)
- **Discussions** - Join conversations (future: Discord/Slack)

### Communication Channels

- **GitHub Issues** - Bug reports, feature requests
- **Pull Requests** - Code contributions, documentation
- **Discussions** - General questions, ideas (future)

### Recognition

We recognize contributors in:
- Contributor list in README
- Release notes when features ship
- Special thanks in community updates

---

## Questions?

If you have questions about contributing, please [open an issue](https://github.com/super-state/mother-brain/issues/new) with the `question` label.

Thank you for contributing to Mother Brain! 🧠❤️
