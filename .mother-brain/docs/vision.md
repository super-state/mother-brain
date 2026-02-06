# Vision: Mother Brain NPX CLI

## The Problem

Mother Brain is powerful but hard to adopt:
- Users must clone the repo and manually copy skills into their project
- No clear path for existing projects to add Mother Brain
- Version updates require manual file replacement
- No way to know if you're running outdated skills
- Skill quality varies - existing project skills may not meet current standards

## The Solution

An NPX-based CLI that makes Mother Brain instantly accessible in any project:

```bash
npx mother-brain init    # Add Mother Brain to any project
npx mother-brain update  # Update to latest version
```

## Target Users

- **Developers** working on projects of any size who want AI-assisted project management
- **Product people** who want structured vision-to-execution workflows
- **Teams** who want shared project documentation (vision, roadmap, tasks)

## Core Features

### 1. One-Command Setup
```bash
npx mother-brain init
```
- Adds core skills to `.github/skills/`
- Creates `.mother-brain/` project folder
- Works in empty or existing projects
- Handles existing `.github/` folders gracefully

### 2. Version Checking
- On skill invoke, checks npm registry for latest version
- Shows notification if update available
- User chooses: update now or continue with current
- Caches check to avoid repeated API calls

### 3. Seamless Updates
```bash
npx mother-brain update
```
- Pulls latest skills from npm package
- Overwrites core skills (mother-brain, child-brain, skill-creator)
- Preserves project-specific skills and state
- User commits the update

### 4. Skill Modernization (for existing projects)
- Analyzes existing `.github/skills/` 
- Compares against skill-creator standards
- Suggests improvements with accept/tweak/reject flow
- Helps upgrade legacy skills to current best practices

### 5. Context-Aware Release
- Detects: Am I in MB framework folder or a project folder?
- Project folder: Release = commit to YOUR repo
- Framework folder: Release = publish to mother-brain repo

## What Gets Committed

Everything:
- `.github/skills/mother-brain/` - Core skill
- `.github/skills/child-brain/` - Feedback skill
- `.github/skills/skill-creator/` - Skill creation skill
- `.github/skills/[your-skills]/` - Project-specific skills
- `.mother-brain/` - Vision, roadmap, tasks, project brain

## Technical Approach

- **Package**: `@super-state/mother-brain` on npm
- **Language**: TypeScript
- **Location**: Monorepo with existing mother-brain repo
- **CLI Framework**: Commander.js or similar
- **Version Check**: npm registry API with daily cache

## Success Metrics

- Time to first use: < 30 seconds (`npx mother-brain init`)
- Update friction: One command + commit
- Adoption: Works on any project without conflicts

## Non-Goals (for MVP)

- GUI/web interface
- CI/CD integration
- Team collaboration features beyond shared files
- Paid features or licensing
