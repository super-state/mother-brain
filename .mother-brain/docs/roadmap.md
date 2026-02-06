# Roadmap: Mother Brain NPX CLI

## Phase 0: Foundation (Current State)
✅ Mother Brain skills exist and work
✅ Framework is functional in its own repo
✅ Learning and self-improvement systems in place

---

## Phase 1: MVP - Basic CLI (Current Phase)

**Goal**: `npx mother-brain init` works and adds skills to any project

### Tasks

- [ ] **Task 001**: Project structure setup
  - Create `cli/` folder in mother-brain repo
  - Initialize npm package with TypeScript
  - Configure build tooling (tsup or similar)
  - Set up package.json for npm publishing

- [ ] **Task 002**: Init command
  - Implement `mother-brain init`
  - Copy skills from package to `.github/skills/`
  - Create `.mother-brain/` folder structure
  - Handle existing `.github/` folder (merge, don't overwrite)
  - Display success message with next steps

- [ ] **Task 003**: Version tracking
  - Add version to each skill's SKILL.md metadata
  - Create `.mother-brain/version.json` to track installed version
  - Implement version comparison logic

- [ ] **Task 004**: Publish to npm
  - Configure npm publishing for @super-state/mother-brain
  - Set up GitHub Action for automated publishing on release
  - Test `npx mother-brain init` end-to-end

---

## Phase 2: Updates & Version Checking

**Goal**: Users know when updates are available and can update easily

### Tasks

- [ ] **Task 005**: Update command
  - Implement `mother-brain update`
  - Pull latest skills from npm package
  - Preserve project-specific content
  - Show changelog/what's new

- [ ] **Task 006**: Version check on invoke
  - Modify mother-brain SKILL.md to check version at startup
  - Query npm registry for latest version
  - Cache result (once per day)
  - Display update notification if outdated

- [ ] **Task 007**: Graceful offline handling
  - Skip version check if offline
  - Don't block usage if npm is unreachable
  - Show cached version info

---

## Phase 3: Skill Modernization

**Goal**: Help users upgrade their existing skills to current standards

### Tasks

- [ ] **Task 008**: Skill analyzer
  - Scan existing `.github/skills/` on init
  - Compare structure against skill-creator template
  - Identify gaps (missing sections, outdated patterns)

- [ ] **Task 009**: Improvement suggestions
  - Generate specific suggestions per skill
  - Present in accept/tweak/reject flow
  - Apply accepted changes

- [ ] **Task 010**: Skill upgrade wizard
  - Interactive mode for each skill
  - Ask clarifying questions (purpose, domain, etc.)
  - Generate improved SKILL.md

---

## Phase 4: Polish & Ecosystem

**Goal**: Production-ready CLI with great UX

### Tasks

- [ ] **Task 011**: Help and documentation
  - `mother-brain --help` with clear usage
  - `mother-brain docs` to open documentation
  - Error messages with actionable guidance

- [ ] **Task 012**: Status command
  - `mother-brain status` shows installed version, update availability
  - Lists skills installed
  - Shows project state summary

- [ ] **Task 013**: Uninstall command
  - `mother-brain uninstall` removes core skills
  - Preserves project-specific skills and .mother-brain/
  - Clean removal option

---

## Future Phases (Post-MVP)

- **Team sync**: Share updates across team via git
- **Skill marketplace**: Browse and install community skills
- **Project templates**: Start new projects with pre-configured skills
- **Analytics**: Usage insights (opt-in)
