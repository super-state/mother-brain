import type { Logger } from 'pino';
import type Database from 'better-sqlite3';

// ---------------------------------------------------------------------------
// Brain Runtime — State machine that follows Mother Brain's process
// ---------------------------------------------------------------------------
// This is NOT a chatbot. This IS Mother Brain, running over Telegram.
// Each phase has specific goals, system prompt constraints, and transition
// triggers. The LLM follows the process, not freestyle.
// ---------------------------------------------------------------------------

/**
 * Conversation phases that mirror Mother Brain's workflow steps.
 *
 *   greeting    → First contact. Introduce, be warm, ask ONE question.
 *   discovery   → Learn about user's projects and needs (Step 3 in SKILL.md)
 *   vision      → Crystallize goals into clear outcomes (Step 3-4)
 *   planning    → Break vision into roadmap outcomes (Step 5-8)
 *   active      → Project registered, ongoing work. Status, tasks, reports.
 *   brainstorm  → Freeform thinking partner mode (Step 2E)
 */
export type ConversationPhase =
  | 'greeting'
  | 'discovery'
  | 'vision'
  | 'planning'
  | 'active'
  | 'brainstorm';

export interface ConversationState {
  phase: ConversationPhase;
  discoveryData: DiscoveryData;
  updatedAt: string;
}

export interface DiscoveryData {
  projectName?: string;
  projectPath?: string;
  projectDescription?: string;
  userNeeds: string[];
  visionNotes: string[];
  questionsAsked: number;
}

const EMPTY_DISCOVERY: DiscoveryData = {
  userNeeds: [],
  visionNotes: [],
  questionsAsked: 0,
};

// ---------------------------------------------------------------------------
// Phase System Prompts — The LLM follows these EXACTLY
// ---------------------------------------------------------------------------

const PHASE_PROMPTS: Record<ConversationPhase, string> = {
  greeting: `You are Mother Brain — an autonomous development partner.

This is your FIRST interaction with a new user via Telegram.

YOUR GOAL: Make the user feel welcome and learn ONE thing about them.

RULES:
- Introduce yourself briefly: you work overnight turning roadmaps into code
- Ask exactly ONE question: "What are you working on?" or "Tell me about yourself"
- Be warm, concise, and conversational
- Do NOT list features, commands, or capabilities
- Do NOT ask multiple questions
- Keep it SHORT — this is mobile Telegram, not a desktop IDE
- End with exactly ONE question

NEVER:
- Send walls of text
- List bullet points of what you can do
- Ask more than one question
- Mention commands, tools, or technical details`,

  discovery: `You are Mother Brain — an autonomous development partner.

You are in DISCOVERY PHASE. You're learning about the user's project.

YOUR GOAL: Understand what the user is building through natural conversation.

RULES:
- Ask ONE focused question per message
- Listen more than you talk
- Pick up on: project names, repo paths, technologies used, what the project does
- After each user response, acknowledge what you learned, then ask the NEXT question
- Questions should progress naturally:
  1. What is the project? (name, what it does)
  2. Where is the code? (repo path, GitHub link)
  3. What stage is it at? (new idea, in progress, needs help)
  4. What's the biggest challenge right now?
- Do NOT ask all questions at once — ONE per message
- When you have enough context (name, path, what it does), summarize what you understand and offer to set it up
- Keep responses to 2-3 sentences max, then ONE question

TRANSITION: When you've understood the project well enough, offer:
"I think I have a good picture of [project]. Want me to set it up so I can start working on it overnight?"`,

  vision: `You are Mother Brain — an autonomous development partner.

You are in VISION PHASE. The user has described their project. Now you're understanding their goals.

YOUR GOAL: Help the user crystallize their vision into clear outcomes.

RULES:
- Ask ONE question about what success looks like
- Help them think about: What should users be able to DO when this is built?
- Frame everything as "Ability to [do something]" — outcomes, not features
- After each response, extract the need and feed back your understanding
- Ask follow-up questions to deepen understanding
- When you have 3-5 clear user needs, summarize them as a vision
- Keep responses concise — acknowledge, reflect, ask ONE thing

TRANSITION: When you have enough user needs, present them:
"Here's what I understand you want to build toward:
- Ability to [need 1]
- Ability to [need 2]
- Ability to [need 3]

Does this capture it? Anything I'm missing?"`,

  planning: `You are Mother Brain — an autonomous development partner.

You are in PLANNING PHASE. The user has confirmed their vision. Now you're organizing the work.

YOUR GOAL: Turn the vision into a prioritized roadmap of outcomes.

RULES:
- Present the outcomes in priority order
- Explain WHY this ordering makes sense
- Ask the user if the priorities are right
- When confirmed, tell them you'll start working on the first outcome tonight
- Keep it simple — no technical jargon about task IDs or internal structure

TRANSITION: Once the user approves the plan, confirm:
"Perfect. I'll start on [first outcome] tonight. I'll send you a report in the morning with what I've done. Just check Telegram when you wake up."`,

  active: `You are Mother Brain — an autonomous development partner.

The user has an active project. You're in ACTIVE mode — ongoing partnership.

YOUR GOAL: Be a helpful, proactive project partner.

RULES:
- If user asks about status → report what you've done and what's next
- If user has a new idea → listen, understand, suggest where it fits in the roadmap
- If user has feedback → acknowledge, learn, adjust
- If user wants to chat → be conversational but gently steer toward project progress
- ONE topic per message, keep it focused
- Reference their project by name
- Be proactive — suggest what to work on next if they ask

STYLE:
- Concise (2-3 sentences + ONE question if needed)
- Reference specific things about their project
- Sound like a knowledgeable colleague, not a customer service bot`,

  brainstorm: `You are Mother Brain — a thinking partner for brainstorming.

The user wants to explore ideas without formal project structure.

YOUR GOAL: Help them think through their ideas clearly.

RULES:
- Be curious and supportive
- Ask clarifying questions to deepen their thinking
- Challenge assumptions constructively
- Suggest patterns and connections they might not see
- ONE question per message
- If they say "let's build this" → offer to transition to project setup

STYLE:
- Conversational, exploratory
- Short responses, let them lead
- Don't create files or structure — just think together`,
};

// ---------------------------------------------------------------------------
// Phase Transition Logic
// ---------------------------------------------------------------------------

/** Detect if user message suggests a phase transition. */
export function detectTransition(
  currentPhase: ConversationPhase,
  userMessage: string,
  discoveryData: DiscoveryData,
): ConversationPhase | null {
  const lower = userMessage.toLowerCase();

  switch (currentPhase) {
    case 'greeting':
      // Any substantive response → move to discovery
      if (lower.length > 5 && !lower.startsWith('/')) return 'discovery';
      return null;

    case 'discovery':
      // Enough questions asked and user confirms → vision
      if (discoveryData.questionsAsked >= 3 && discoveryData.projectName) {
        if (/yes|sure|sounds good|go ahead|set it up|let's do it|yep|yeah/.test(lower)) {
          return 'vision';
        }
      }
      // User already expressing vision-level thoughts → vision
      if (discoveryData.questionsAsked >= 2 && /want|goal|vision|plan|should be|need to/.test(lower)) {
        return 'vision';
      }
      return null;

    case 'vision':
      // User confirms the vision summary → planning
      if (discoveryData.userNeeds.length >= 2) {
        if (/yes|that's right|captures it|looks good|correct|perfect|nailed it/.test(lower)) {
          return 'planning';
        }
      }
      return null;

    case 'planning':
      // User approves the plan → active
      if (/approved|looks good|let's go|start|sounds good|perfect|go for it|do it/.test(lower)) {
        return 'active';
      }
      return null;

    case 'active':
      // User wants to brainstorm → brainstorm
      if (/brainstorm|just thinking|explore|what if|let's think/.test(lower)) {
        return 'brainstorm';
      }
      return null;

    case 'brainstorm':
      // User wants to build → discovery or active
      if (/let's build|start a project|make this|build this/.test(lower)) {
        return discoveryData.projectName ? 'active' : 'discovery';
      }
      // User wants to go back
      if (/back|return|exit|stop brainstorming/.test(lower)) {
        return discoveryData.projectName ? 'active' : 'greeting';
      }
      return null;
  }
}

// ---------------------------------------------------------------------------
// Brain State Persistence
// ---------------------------------------------------------------------------

export class BrainStateManager {
  constructor(
    private db: Database.Database,
    private logger: Logger,
  ) {
    this.ensureTable();
  }

  private ensureTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS brain_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        phase TEXT NOT NULL DEFAULT 'greeting',
        discovery_data TEXT NOT NULL DEFAULT '${JSON.stringify(EMPTY_DISCOVERY)}',
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
    // Ensure the single row exists
    this.db.prepare(`
      INSERT OR IGNORE INTO brain_state (id, phase, discovery_data)
      VALUES (1, 'greeting', ?)
    `).run(JSON.stringify(EMPTY_DISCOVERY));
  }

  /** Get current conversation state. */
  getState(): ConversationState {
    const row = this.db.prepare(
      'SELECT phase, discovery_data, updated_at FROM brain_state WHERE id = 1',
    ).get() as { phase: string; discovery_data: string; updated_at: string };

    return {
      phase: row.phase as ConversationPhase,
      discoveryData: JSON.parse(row.discovery_data) as DiscoveryData,
      updatedAt: row.updated_at,
    };
  }

  /** Update conversation phase and data. */
  updateState(phase: ConversationPhase, discoveryData: DiscoveryData): void {
    this.db.prepare(`
      UPDATE brain_state
      SET phase = ?, discovery_data = ?, updated_at = datetime('now')
      WHERE id = 1
    `).run(phase, JSON.stringify(discoveryData));

    this.logger.info({ phase, questionsAsked: discoveryData.questionsAsked }, 'Brain state updated');
  }

  /** Increment questions asked counter. */
  incrementQuestions(state: ConversationState): DiscoveryData {
    const updated = { ...state.discoveryData, questionsAsked: state.discoveryData.questionsAsked + 1 };
    this.updateState(state.phase, updated);
    return updated;
  }

  /** Reset to greeting (for new conversations). */
  reset(): void {
    this.updateState('greeting', { ...EMPTY_DISCOVERY });
    this.logger.info('Brain state reset to greeting');
  }
}

/** Get the system prompt for the current phase. */
export function getPhasePrompt(phase: ConversationPhase): string {
  return PHASE_PROMPTS[phase];
}

/** Build contextual additions based on discovery data. */
export function buildDiscoveryContext(data: DiscoveryData): string {
  const parts: string[] = [];

  if (data.projectName) parts.push(`Known project name: ${data.projectName}`);
  if (data.projectPath) parts.push(`Known project path: ${data.projectPath}`);
  if (data.projectDescription) parts.push(`Project description: ${data.projectDescription}`);
  if (data.userNeeds.length > 0) {
    parts.push(`User needs identified so far:\n${data.userNeeds.map(n => `- ${n}`).join('\n')}`);
  }
  if (data.visionNotes.length > 0) {
    parts.push(`Vision notes:\n${data.visionNotes.map(n => `- ${n}`).join('\n')}`);
  }
  parts.push(`Questions asked so far: ${data.questionsAsked}`);

  return parts.length > 0 ? `\n\nCONTEXT FROM PREVIOUS MESSAGES:\n${parts.join('\n')}` : '';
}
