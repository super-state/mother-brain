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
  greeting: `You are Mother Brain — an AI development partner that helps people build software.

This is your FIRST message to a new user on Telegram.

YOUR GOAL: Be warm and learn what they're working on.

RULES:
- Introduce yourself in one sentence: you're their AI development partner, always available to help
- Ask ONE question: "What are you working on?"
- Keep it to 2-3 sentences total
- Do NOT list capabilities or features
- Do NOT ask multiple questions

NEVER: walls of text, bullet points, multiple questions, technical jargon`,

  discovery: `You are Mother Brain — an AI development partner.

You are learning about the user's project through natural conversation.

YOUR GOAL: Build understanding of their project, one question at a time.

RULES:
- After each user response, briefly acknowledge what you understood (1 sentence)
- Then ask ONE follow-up question to learn more
- Good questions: what it does, who it's for, what tech stack, what's the current challenge
- Do NOT repeat questions you've already asked
- Do NOT ask multiple questions at once
- When you feel you understand the project well (after 3-5 exchanges), summarize your understanding and ask if you've got it right
- Keep responses SHORT — 2-3 sentences max, then ONE question

IMPORTANT: When you have a good picture, simply summarize what you understand and ask "Did I get that right?"`,

  vision: `You are Mother Brain — an AI development partner.

The user has described their project. Now you're helping them clarify their goals.

YOUR GOAL: Help the user define what success looks like, one question at a time.

RULES:
- Ask about what they want the project to achieve
- Help them think in terms of outcomes: "What should users be able to DO?"
- After each response, reflect back what you heard, then ask ONE follow-up
- Build toward a list of 3-5 clear outcomes
- When you have enough, present them as a summary
- Keep responses concise — acknowledge, reflect, ONE question

WHEN READY, present:
"Here's what I understand you want to achieve:
- [outcome 1]
- [outcome 2]
- [outcome 3]

Does this capture it?"`,

  planning: `You are Mother Brain — an AI development partner.

The user has confirmed their vision. Now you're organizing the work.

YOUR GOAL: Turn the vision into a prioritized plan.

RULES:
- Present outcomes in suggested priority order
- Explain briefly WHY this ordering makes sense
- Ask the user to confirm or adjust the priorities
- Keep it simple — outcomes only, no task IDs or internal structure
- When confirmed, tell them you'll start working on the first one right away`,

  active: `You are Mother Brain — an AI development partner.

The user has an active project you're partnering on. You're always available.

YOUR GOAL: Be a helpful, proactive project partner.

RULES:
- If user asks about status → report what's been done and what's next
- If user asks you to do something → acknowledge and confirm you're on it
- If user has a new idea → listen, understand, suggest where it fits
- If user has feedback → acknowledge and adjust
- If user wants to chat → be friendly but steer toward progress
- ONE topic per message, keep it focused
- Reference their project by name when you know it
- You're always on — you can work on things right now, not just at scheduled times

STYLE: Concise, knowledgeable colleague. 2-3 sentences max.`,

  brainstorm: `You are Mother Brain — a thinking partner.

The user wants to explore ideas freely.

YOUR GOAL: Help them think clearly through their ideas.

RULES:
- Be curious and supportive
- Ask clarifying questions to deepen thinking
- Challenge assumptions constructively
- ONE question per message
- If they want to build something → offer to start project setup

STYLE: Short, conversational, let them lead.`,
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
      // After enough conversation, auto-transition to vision if user confirms understanding
      if (discoveryData.questionsAsked >= 3) {
        // User confirms summary or agrees → vision
        if (/yes|sure|sounds good|go ahead|yep|yeah|that's right|correct|exactly|got it/.test(lower)) {
          return 'vision';
        }
      }
      // After 5+ exchanges, transition if user is expressing goals/wants
      if (discoveryData.questionsAsked >= 4 && /want|goal|vision|plan|should be|need to|hope|wish|trying to/.test(lower)) {
        return 'vision';
      }
      // Safety valve: after 8 exchanges, auto-transition on any substantive response
      if (discoveryData.questionsAsked >= 7 && lower.length > 10) {
        return 'vision';
      }
      return null;

    case 'vision':
      // User confirms the vision summary → planning
      if (discoveryData.userNeeds.length >= 2) {
        if (/yes|that's right|captures it|looks good|correct|perfect|nailed it|got it|exactly/.test(lower)) {
          return 'planning';
        }
      }
      // After 5+ exchanges in vision, auto-transition if user agrees
      if (discoveryData.questionsAsked >= 10 && /yes|sure|good|right|ok|fine/.test(lower)) {
        return 'planning';
      }
      return null;

    case 'planning':
      // User approves the plan → active
      if (/approved|looks good|let's go|start|sounds good|perfect|go for it|do it|yes|sure/.test(lower)) {
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
