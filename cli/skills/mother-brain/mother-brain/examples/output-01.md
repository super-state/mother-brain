# Example Output: Music Marketing SaaS Project Structure

## What Mother Brain Created

### Vision Document (`docs/vision.md`)
```markdown
# MusicMarketingSaaS - Vision

## The Problem
Independent artists struggle to market their music effectively without the budget for agencies or access to affordable, simple tools.

## The Vision
In 12 months: 1,000 independent artists using the platform monthly to run professional marketing campaigns, seeing 20%+ increases in streams and followers.

## Target Users
Independent artists and small labels (ages 18-35), tech-savvy but not developers, releasing music regularly.

## Why This Matters
Great music goes unheard. Artists give up due to lack of traction. This democratizes music marketing.

## Success Looks Like
- User Metrics: 1,000 active users, 50% retention
- Business Metrics: Artists see 20%+ stream increases
- Impact: Artists report career-changing results

## Timeline & Constraints
- 6 months to MVP
- Budget: $5k for hosting/APIs
- Time: 20 hours/week

## MVP Definition
Connect Spotify, submit track to 5 playlists, track status. Success = 10 artists get 1 placement.

## Strategic Themes
1. Artist Empowerment - Give artists professional tools
2. Marketing Simplification - One platform, not five
3. Platform Integration - Spotify, social media, email
4. Data-Driven Insights - Show what's working
```

### Roadmap (`docs/roadmap.md`)
```markdown
# MusicMarketingSaaS - Roadmap

## Phase 1: Foundation (Weeks 1-3)
**Goal**: Prove core concept with Spotify playlist submission
**Strategic Theme**: Platform Integration

**Deliverables**:
- [ ] Task 001: User authentication system
- [ ] Task 002: Spotify OAuth integration
- [ ] Task 003: Playlist database setup
- [ ] Task 004: Submission form UI

**Skills Available**: auth-manager, spotify-api-integrator

## Phase 2: MVP Features (Weeks 4-8)
**Goal**: Complete playlist submission workflow
**Strategic Theme**: Marketing Simplification

**Deliverables**:
- [ ] Task 005: Curator matching algorithm
- [ ] Task 006: Submission tracking dashboard
- [ ] Task 007: Email notifications
- [ ] Task 008: Artist profile page

**Skills Available**: email-campaign-builder, image-upload-handler

## Phase 3: Beta Launch (Weeks 9-12)
**Goal**: Get first 10 artists using the platform
**Strategic Theme**: Artist Empowerment

**Deliverables**:
- [ ] Task 009: Onboarding flow
- [ ] Task 010: Analytics dashboard
- [ ] Task 011: Landing page
- [ ] Task 012: Beta user feedback system

## MVP Checkpoint (Week 12)
✅ 10 artists signed up
✅ At least 50 playlist submissions made
✅ At least 1 artist got a playlist placement
✅ System stable and bug-free

## Future Phases (Post-MVP)
- Social media scheduling
- Email campaign automation
- Advanced analytics
- Subscription tiers
```

### Skills Created

1. **auth-manager** - User authentication with sessions
2. **spotify-api-integrator** - OAuth, track lookup, playlist API
3. **email-campaign-builder** - Welcome emails, notifications
4. **image-upload-handler** - Album art, profile photos

### First Task Document (`docs/tasks/001-user-authentication.md`)
```markdown
# Task 001: User Authentication System

**Status**: 🟡 In Progress
**Phase**: Phase 1 - Foundation
**Strategic Theme**: Platform Integration
**Assigned**: 2026-02-03

## Objective
Create secure user registration and login system so artists can create accounts and access the platform.

## Success Criteria
- [ ] Users can sign up with email/password
- [ ] Users can log in and stay authenticated
- [ ] Passwords are securely hashed
- [ ] Session management works correctly
- [ ] Basic profile page exists

## Approach
Use auth-manager skill to scaffold authentication system with Express.js and JWT tokens.

## Dependencies
- None (first task)

## Skills to Use
- auth-manager (will be created and used)

## Deliverables
- `/src/auth/` directory with auth routes
- User model with bcrypt password hashing
- JWT token generation/validation
- Login and signup API endpoints
- Basic profile endpoint

## Notes & Decisions
[To be filled during execution]

## Validation
[ ] Auth endpoints built and tested
[ ] Can create account and log in
[ ] User confirmed functionality works
```

### Project Structure
```
MusicMarketingSaaS/
├── docs/
│   ├── vision.md
│   ├── roadmap.md
│   └── tasks/
│       └── 001-user-authentication.md
├── .github/
│   └── skills/
│       ├── auth-manager/
│       ├── spotify-api-integrator/
│       ├── email-campaign-builder/
│       └── image-upload-handler/
├── src/
│   ├── auth/
│   ├── api/
│   ├── models/
│   └── utils/
├── README.md
└── package.json
```

## User Experience Flow

1. **User starts Mother Brain** → Vision discovery wizard (8 questions)
2. **Mother Brain analyzes** → Identifies 4 core skills needed
3. **Creates skills** → Invokes skill-creator 4 times
4. **Generates roadmap** → 3 phases, 12 tasks total
5. **Starts Task 001** → Uses auth-manager skill
6. **Validates with user** → "Does this work properly?"
7. **User confirms** → Task marked complete
8. **Moves to Task 002** → Continues building...

## Key Features Demonstrated

✅ Vision-driven planning (WHY before HOW)
✅ Skill identification from patterns
✅ Phased execution roadmap
✅ Task documentation with validation
✅ Best-practice project structure
✅ Session continuity (can pause/resume)
✅ User validation at each step
