# Vision Discovery — Full Procedure

   
   **Purpose**: Adaptive, research-driven discovery that evolves understanding with each user response. Mother Brain becomes an expert in the user's domain DURING the conversation, not after.
   
   **ADAPTIVE DISCOVERY PROTOCOL (MANDATORY)**:
   
   This is NOT a static questionnaire. After EACH user response:
   1. Extract keywords and domain signals
   2. Research the domain using `web_search`
   3. Identify knowledge gaps and skill needs
   4. Generate dynamic follow-up questions based on research
   5. Build running list of skill candidates
   
   **Step 3.1: Opening Question**
   
   - Start with the core question:
     ```
     🧠 Vision Discovery
     
     Tell me about what you want to build. 
     What problem are you solving, or what opportunity are you pursuing?
     ```
   
   - Use `ask_user` with freeform enabled
   
   **Step 3.2: Adaptive Response Loop (REPEAT UNTIL VISION IS COMPLETE)**
   
   **After EACH user response, do ALL of the following:**
   
   **3.2.1: Extract Domain Signals**
   - Parse user response for:
     - Industry/domain keywords (game, e-commerce, healthcare, etc.)
     - Technology mentions (React, Shopify, Unity, etc.)
     - Style/aesthetic mentions (minimal, retro, professional, etc.)
     - User type mentions (developers, consumers, businesses, etc.)
     - Problem space indicators (tracking, discovery, automation, etc.)
   
   - Display:
     ```
     📘 Noted: [brief summary of what was understood]
     ```
   
   **3.2.2: Research Domain (MANDATORY)**
   - For EACH new domain signal, research using `web_search`:
     - "[domain] best practices"
     - "[domain] common patterns"
     - "[domain] user expectations"
     - "[technology] implementation approaches"
   
   - Store research findings in memory for:
     - Skill creation later
     - Follow-up question generation
     - Understanding what the user might NOT know to ask
   
   **3.2.3: Identify Knowledge Gaps**
   - Based on research, determine:
     - What aspects of the domain haven't been discussed yet?
     - What decisions does the user need to make?
     - What are common pitfalls in this space?
     - What skills will Mother Brain need to help with this?
   
   - Add skill candidates to running list:
     ```
     🛠️ Skill needs identified so far:
     - [skill-1]: [why it's needed]
     - [skill-2]: [why it's needed]
     ```
   
   **3.2.4: Generate Dynamic Follow-Up Question**
   - Based on research and gaps, ask the MOST RELEVANT next question
   - This should NOT be from a static list - it should be informed by:
     - What research revealed about the domain
     - What the user hasn't addressed yet
     - What decisions will significantly impact the project
   
   - Example evolution:
     - User says "roguelite car game with storybook art"
     - Research: roguelite mechanics, car game physics, storybook illustration
     - Generated question: "Roguelites rely heavily on the core gameplay loop - what's the moment-to-moment action? Is it racing, combat, exploration, or something else?"
   
   - Use `ask_user` with:
     - 2-3 relevant options based on research
     - Freeform allowed for complex answers
   
   **Step 3.3: Core Areas to Cover (Ensure These Are Addressed)**
   
   Through adaptive questioning, ensure these areas are explored (not as a checklist, but organically based on the domain):
   
   - **The Problem/Opportunity**: What pain point or gap exists?
   - **The Vision**: What does success look like?
   - **The Users**: Who benefits? Who uses it?
   - **User Needs (CRITICAL)**: What specific abilities does the user need? Capture these as "Ability to [do something]" statements. These become the foundation for the outcome-driven roadmap.
   - **Differentiators**: What makes this unique in the space?
   - **Aesthetic/Experience**: How should it feel? Look? Sound?
   - **Constraints**: Budget, skills, platform limitations?
   - **MVP Scope**: Which user needs are essential for MVP vs nice-to-have?
   - **Data Sensitivity (MANDATORY)**: If project involves user/customer data:
     - Identify what data is handled (PII, orders, payments, health data, financial data, personal info)
     - Ask: "Who should have access to this data?"
     - Flag access control/authentication as a hard requirement
     - Document in vision.md under "Security & Access Requirements"
     - This triggers authentication/authorization tasks in Phase 1 (not post-MVP)
     - Example: "Dashboard shows customer orders → authentication required before deployment"
   
   **Domain-Specific Questions (Generated From Research)**:
   - For games: gameplay loop, art style, audio needs, target platform
   - For e-commerce: payment integration, inventory management, shipping
   - For SaaS: authentication, multi-tenancy, pricing model
   - For mobile apps: offline capability, push notifications, app store requirements
   - For Shopify: theme vs app, API usage, merchant needs
   - For APIs: authentication, rate limiting, documentation needs
   
   **Step 3.4: Vision Summary and Skill Pre-Planning**
   
   - When sufficient understanding is reached (typically 6-10 exchanges):
   
   - Display comprehensive summary:
     ```
     🧠 Vision Summary
     
     **What You're Building:**
     [1-2 sentence description]
     
     **Who It's For:**
     [Target users/audience]
     
     **Key Features:**
     - [Feature 1]
     - [Feature 2]
     - [Feature 3]
     
     **Aesthetic/Experience:**
     [How it should look, feel, sound]
     
     **Success Looks Like:**
     [What proves this works]
     
     **Domain Research Findings:**
     [Key insights from research that will inform development]
     
     🛠️ **Skills Mother Brain Will Need:**
     - [skill-1]: [what it will handle]
     - [skill-2]: [what it will handle]
     - [skill-3]: [what it will handle]
     ```
   
   - Use `ask_user` with choices:
     - "This captures it perfectly"
     - "Mostly right, but let me clarify something"
     - "I want to change the direction"
   
   - If clarification needed: Ask follow-up, update summary
   - If direction change: Return to Step 3.2
   
   **Step 3.5: Store Research and Skill Candidates**
   
   - Before proceeding to project setup:
     - Store domain research in `.mother-brain/domain-research.md`
     - Store skill candidates in `.mother-brain/skill-candidates.md`
   - These will be used during:
     - Roadmap generation (Step 5)
     - Skill creation (Step 6)
     - Task execution (Step 9)
   
   **NOTE: Do NOT ask about timeline/duration.** AI execution speed is not a constraint.

   - Proceed to Step 3.6 (Project Folder Setup)
