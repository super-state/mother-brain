# Outcome Discovery — Mini Requirements Session (Per Outcome / Phase)

Use this procedure when:
- The user wants to add a new outcome to the roadmap
- The user wants to pivot mid-outcome to a different outcome
- The user is about to start an existing roadmap outcome that is still a placeholder or unclear (refine it before execution)

Purpose:
- Treat each new outcome like a mini vision session: clarify intent, do lightweight research, consult project constraints, detect skill gaps, and only then plan it onto the roadmap.
- End with a clear decision: do it now vs schedule it for later (and confirm priority).

---

## Step OD.1: Capture the Outcome (Freeform)

Display:
```
🔎 Outcome Discovery

Tell me the outcome you want.
Write it as: "Ability to [do something]" if you can.
```

Use `ask_user` with `allow_freeform: true`.

---

## Step OD.2: Project Brain Gate (Before Planning)

Before drafting acceptance criteria and demo/proof, consult Project Brain:
- Read `.mother-brain/project-brain.md` (if it exists)
- Apply relevant preferences/constraints:
  - Style & tone expectations
  - Validation checks to preserve
  - Known integration constraints
  - Any "do/don't" rules discovered from prior work

---

## Step OD.3: Adaptive Clarification Loop (Repeat Until Clear)

After EACH user response:
1. Extract domain signals and constraints:
   - Who is the user?
   - What is the exact ability (scope boundaries)?
   - What data is involved (PII/orders/payments/health)?
   - What does "done" look like (proof)?
2. If a new/unclear domain is detected, do quick research with `web_search`:
   - "[domain] best practices"
   - "[domain] common pitfalls"
   - "[domain] UX expectations"
3. Identify likely skill needs (do we need a new skill or to invoke an existing one?)
4. Ask the single most important next question (avoid long questionnaires).

Use `ask_user` with 2-3 choices whenever discrete options exist, otherwise allow freeform.

Stop the loop only when:
- The outcome statement is unambiguous
- Acceptance criteria can be written as testable user checks
- A demo/proof path is clear

---

## Step OD.4: Draft the Outcome Package (Batch Correction)

Create a draft:
- Outcome name: `📋 Ability to ...`
- "So that" benefit line (why this matters)
- Acceptance criteria (3-7 items, testable by the user)
- Demo / Proof (what will open, where, and the quick verification path)
- Internal tasks (high-level list; implementation details only)

Then ask for correction (batch, not per-line):

Use `ask_user`:
- "✅ Looks right — proceed"
- "✏️ Needs adjustment (tell me what to change)"
- "🔄 Actually different outcome (restart discovery)"

If adjustment/restart is chosen, continue OD.3.

---

## Step OD.5: Skill Check (Autonomous, With Elder Brain Gate)

- Scan existing project skills (`.github/skills/`) for relevant capabilities.
- If a capability gap is detected:
  - FIRST: Consult Elder Brain RETRIEVE for relevant gotchas/patterns:
    - Invoke Elder Brain RETRIEVE for the domains/technologies the skill will touch
    - If Elder Brain returns relevant info, bake it into the skill context
  - Then invoke `skill-creator` to create/update the necessary skill(s) using:
    - Project Brain preferences (project-specific constraints)
    - Lightweight domain research (if needed)
    - Elder Brain gotchas/patterns (cross-project defensive knowledge)
  - Do not ask for permission to create the skill; do it as part of discovery.

---

## Step OD.6: Priority + Scheduling Decision (User Choice)

Load:
- `.mother-brain/docs/value-framework.md` (if it exists)
- `.mother-brain/docs/vision.md` and `.mother-brain/docs/roadmap.md`

Determine recommended priority:
- If Value Framework exists: score outcome and compare to nearby outcomes
- Otherwise: assess vision alignment, user impact, effort, dependencies

Use `ask_user`:
- "🚀 Do this next (make it the active/next outcome)"
- "🗓 Add to roadmap for later (keep current plan)"
- "📌 Adjust priority (tell me higher/lower)"

If "Adjust priority":
- Ask for brief rationale (freeform), apply the override, and (if repeated) flag for Value Framework weight adjustment.

---

## Step OD.7: Write It Into the Roadmap

- Insert (or refine) the outcome in `.mother-brain/docs/roadmap.md` with:
  - Acceptance criteria checklist
  - Demo / Proof section
  - Priority score / note
  - Internal tasks list
- If it belongs in a new phase, create the phase section and explain why (briefly).

Update `.mother-brain/session-state.json`:
- If "Do this next": set the new outcome as active
- Otherwise: keep current outcome, just record that a new outcome was added

Return control to the menu the user came from:
- If called from Roadmap (Layer 2): return to Step 11
- If called from Outcome work (Layer 3 pivot): return to Step 10E (or Step 11 if the user navigated up)

---

Key rules:
- Discovery happens BEFORE planning/execution for a new outcome.
- Always provide the do-now vs later choice after discovery.
- Keep questions tight: one meaningful question per loop.

