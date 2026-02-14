# Technology & Pattern Analysis — Full Procedure

   - **Dynamic Research-Driven Discovery**:
     
     **Step 5.1: Identify Project Type**
     - From vision document, determine project category:
       - Web app, mobile app, desktop software, CLI tool, library/framework
       - Gaming, SaaS, ecommerce, content platform, developer tooling, etc.
     
     **Step 5.2: Market & Competitor Analysis (MANDATORY)**
     - Use `web_search` to research:
       1. "[project domain] competitor analysis [current year]"
       2. "top [project type] apps/platforms comparison"
       3. "[project domain] market landscape and gaps"
       4. "what makes successful [project type] stand out"
     - Save findings to `.mother-brain/docs/research/market-analysis.md`
     - Document:
       - **Direct Competitors**: Who else solves this problem? What are they?
       - **Strengths**: What do competitors do well?
       - **Weaknesses**: Where do competitors fall short?
       - **Market Gaps**: Unmet needs, underserved segments
       - **Differentiation Opportunities**: How can this project stand out?
     
     **Step 5.3: User Research (MANDATORY)**
     - Use `web_search` to research:
       1. "what [target users] want in [project domain]"
       2. "[target user] pain points and frustrations with [existing solutions]"
       3. "[project domain] user research findings"
       4. "why users leave/switch [competitor type] apps"
     - Save findings to `.mother-brain/docs/research/user-research.md`
     - Document:
       - **Target Users**: Who exactly are they? Demographics, behaviors
       - **Pain Points**: What frustrates users with existing solutions?
       - **Unmet Needs**: What do users wish they had?
       - **Must-Have Features**: Non-negotiables for this user base
       - **Delighters**: Features that would surprise and delight
     
     **Step 5.4: Technical Best Practices Research**
     - Use `web_search` to research:
       1. "best practices for [project type] development [current year]"
       2. "team roles needed for [project type] projects"
       3. "common technical patterns in [project type]"
       4. "project management methodology for [project type]"
       5. "documentation standards for [project type]"
       6. "quality assurance approach for [project type]"
     
     **Step 5.4.1: Technology Pitfalls & Gotchas Research (MANDATORY)**
     - For EACH technology/platform/tool identified in vision or research:
       
       **First, invoke Elder Brain RETRIEVE for each technology:**
       - Invoke `skill elder-brain` with query for each technology
       - Elder Brain searches the experience vault and returns known gotchas
       - If gotchas found: use this knowledge to inform skill creation (no re-research needed)
       
       **If Elder Brain has no knowledge, research and contribute:**
       - Use `web_search` to research:
         1. "common [technology] mistakes and pitfalls [current year]"
         2. "[technology] gotchas first-time users encounter"
         3. "[technology] troubleshooting guide"
       - After research, invoke Elder Brain RECEIVE to store findings in the vault
       - Also save project-specific notes to `.mother-brain/docs/research/[technology]-gotchas.md`
       
       **Result:**
       - Research gets embedded in skills created for this technology
       - Elder Brain grows with each project's discoveries
     
     **Step 5.5: Extract Technical Insights from Research**
     - Parse research results to identify:
       - **Roles/Disciplines**: (e.g., designer, architect, QA, DevOps, DBA)
       - **Methodologies**: (e.g., Agile, TDD, definition of done, sprint planning)
       - **Technical Patterns**: (e.g., auth flows, API design, state management)
       - **Documentation Needs**: (e.g., architecture docs, API specs, test plans)
       - **Tools & Libraries**: (e.g., testing frameworks, design systems, CI/CD)
       - **Quality Standards**: (e.g., accessibility, performance, security)
     
     **Step 5.6: Synthesize & Log Findings** (No User Confirmation Required)
     - Save to `.mother-brain/docs/research/technical-analysis.md`
     - Display findings organized by category (for transparency, not approval):
       ```
       🔍 Research-Based Analysis for [Project Type]:
       
       Market Position:
       - Competitors analyzed: [list]
       - Key differentiation: [how this project is unique]
       
       User Insights:
       - Target users: [who]
       - Top pain points: [list]
       - Must-have features: [list]
       
       Technology Stack:
       - [Recommendations based on research + vision]
       
       Team Roles/Disciplines Identified:
       - [Roles that research suggests are needed]
       
       Methodology Recommendations:
       - [Process/methodology from research]
       
       Repetitive Patterns Found:
       1. [Pattern from research] - [Skill candidate]
       2. [Pattern from research] - [Skill candidate]
       
       Documentation Needs:
       - [Project docs suggested by research]
       
       Quality Standards:
       - [Testing, accessibility, performance standards]
       ```
     
     - **Proceed immediately** to Step 5A (if visual requirements) or Step 6 (Skill Identification)
     - Do NOT ask user to validate or approve research findings - Mother Brain is the expert
   - **After displaying findings**: Proceed to Step 5A (check for visual requirements) or Step 6 (Skill Identification)
