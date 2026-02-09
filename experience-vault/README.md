# 🧙 Experience Vault (Elder Brain)

**The Collective Knowledge Repository**

> **Managed by**: [Elder Brain Skill](../.github/skills/elder-brain/SKILL.md)
> Elder Brain is the active keeper of this vault — it receives, retrieves, and organizes domain knowledge.

## What is This?

Experience Vault is the **domain knowledge layer** of the four-brain architecture — technology-specific wisdom, platform gotchas, and cross-project patterns that apply across ALL projects.

The Four Brains:
- **Mother Brain** = "HOW to facilitate" (process/behavioral)
- **Project Brain** = "What THIS project needs" (project-specific preferences)
- **Child Brain** = "What did we learn?" (analysis and routing)
- **Elder Brain** = "WHAT is true about X" (domain facts — this vault)

## Structure

```
experience-vault/
├── security/          # Auth patterns, data exposure, common vulnerabilities
├── deployment/        # Platform-specific deployment knowledge
├── apis/              # API integration patterns and gotchas
├── databases/         # Schema design, query patterns, ORMs
├── ui/                # Design systems, accessibility, responsive patterns
├── platforms/         # Platform-specific knowledge (Windows, macOS, Linux, mobile)
└── ...                # More domains as they're discovered
```

## How It Works

### 1. **Discovery** (During Project Execution)
When Mother Brain encounters a technology/domain for the first time:
- Research best practices using web_search
- Extract reusable patterns
- Store in appropriate experience-vault/ folder

### 2. **Consultation** (During Planning)
When creating roadmaps or skills:
- Check if relevant domain knowledge exists in experience-vault/
- Use knowledge to inform decisions
- Don't reinvent the wheel

### 3. **Contribution** (By Users)
When users encounter gotchas or discover patterns:
- Submit as GitHub issues with "elder-brain" label
- Community validates and merges
- Everyone benefits immediately

## What Goes Here?

**✅ YES - Domain Knowledge:**
- "Firebase Auth requires Console click-through before first use"
- "Vite deployments need base path config for subdirectories"
- "Environment variables on Vercel need .env.production file"
- "Windows directories need -Force flag in PowerShell"
- "React refs don't work with functional components (use useRef)"

**❌ NO - Not Domain Knowledge:**
- "Check for data exposure before deployment" → Mother Brain (thinking process)
- "User prefers Tailwind over CSS modules" → Project Brain (project-specific)
- "Always validate user input" → Mother Brain (meta-principle)

## Example Entry

```markdown
# experience-vault/deployment/vercel-deployment.md

## Environment Variables

**Problem**: Deploy succeeds but app crashes because env vars aren't set

**Gotcha**: Vercel requires BOTH:
1. Variables defined in Vercel dashboard/CLI
2. `.env.production` file in project for build-time access

**Solution**:
- Add `.env.production` with all required vars (no secrets)
- Set secrets in Vercel dashboard
- Reference in code: `process.env.VITE_API_KEY`

**When to Consult**: During Step 6A (Delivery Strategy Research) for Vercel deployments

**Source**: https://vercel.com/docs/environment-variables
```

## When Mother Brain Consults Elder Brain

- **Step 5**: Technology & Pattern Analysis → Check for known patterns
- **Step 6**: Skill Creation → Embed domain knowledge in skills
- **Step 6A**: Delivery Strategy Research → Check deployment gotchas
- **Step 9**: Task Execution → Validate against known pitfalls

## Contributing

Found a gotcha? Discovered a pattern? Submit it!

1. Create GitHub issue with "elder-brain" label
2. Title: `[Elder Brain] [Domain]: Brief description`
3. Body template:
   ```markdown
   **Domain**: security / deployment / apis / etc.
   **Technology**: Firebase / React / Vercel / etc.
   **Problem**: What goes wrong?
   **Gotcha**: What's the non-obvious thing?
   **Solution**: How to fix/prevent?
   **Source**: Link to docs or reference
   ```

4. Maintainers review and merge into experience-vault/

## Why Git-Based?

- **Free**: Comes with Mother Brain npm package
- **Versioned**: Track evolution of knowledge over time
- **Distributed**: Everyone gets updates when they update Mother Brain
- **Searchable**: grep/search across all domains
- **Collaborative**: PRs and issues for contributions

## Maintenance

- Keep entries focused and specific
- Link to authoritative sources
- Update when technologies change
- Archive obsolete entries (don't delete - history matters)

---

**Remember**: Elder Brain stores WHAT is true. Mother Brain stores HOW to think. Project Brain stores THIS project's preferences.
