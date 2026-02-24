import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { Logger } from 'pino';

// ---------------------------------------------------------------------------
// Persona — the daemon's identity and communication style
// ---------------------------------------------------------------------------

export interface PersonaConfig {
  name: string;
  tagline: string;
  personality: string[];
  greeting: string;
  returningGreeting: string;
  communicationStyle: {
    formality: 'casual' | 'balanced' | 'formal';
    verbosity: 'minimal' | 'balanced' | 'detailed';
    emoji: boolean;
  };
}

const DEFAULT_PERSONA: PersonaConfig = {
  name: 'Mother Brain',
  tagline: 'Your always-on development partner',
  personality: ['helpful', 'concise', 'technical', 'proactive'],
  greeting: [
    "Hey! I'm Mother Brain — your AI development partner. 🧠",
    "",
    "I help you build software — planning, coding, and keeping things on track. I'm always here when you need me.",
    "",
    "What are you working on?",
  ].join('\n'),
  returningGreeting: "Welcome back! Ready to pick up where we left off?",
  communicationStyle: {
    formality: 'balanced',
    verbosity: 'minimal',
    emoji: true,
  },
};

/**
 * Load persona from ~/.mother-brain-daemon/persona.json
 * Falls back to defaults if not found.
 */
export function loadPersona(logger: Logger): PersonaConfig {
  const personaPath = join(homedir(), '.mother-brain-daemon', 'persona.json');

  if (!existsSync(personaPath)) {
    logger.info('No persona.json found — using default persona');
    return DEFAULT_PERSONA;
  }

  try {
    const raw = JSON.parse(readFileSync(personaPath, 'utf-8'));
    const persona: PersonaConfig = {
      name: raw.name ?? DEFAULT_PERSONA.name,
      tagline: raw.tagline ?? DEFAULT_PERSONA.tagline,
      personality: Array.isArray(raw.personality) ? raw.personality : DEFAULT_PERSONA.personality,
      greeting: raw.greeting ?? DEFAULT_PERSONA.greeting,
      returningGreeting: raw.returningGreeting ?? DEFAULT_PERSONA.returningGreeting,
      communicationStyle: {
        formality: raw.communicationStyle?.formality ?? DEFAULT_PERSONA.communicationStyle.formality,
        verbosity: raw.communicationStyle?.verbosity ?? DEFAULT_PERSONA.communicationStyle.verbosity,
        emoji: raw.communicationStyle?.emoji ?? DEFAULT_PERSONA.communicationStyle.emoji,
      },
    };
    logger.info({ name: persona.name }, 'Persona loaded');
    return persona;
  } catch (error) {
    logger.warn({ error }, 'Failed to parse persona.json — using defaults');
    return DEFAULT_PERSONA;
  }
}

/** Build LLM system prompt from persona. */
export function buildPersonaSystemPrompt(persona: PersonaConfig): string {
  const traits = persona.personality.join(', ');
  const { formality, verbosity, emoji } = persona.communicationStyle;
  const emojiRule = emoji ? 'Use emoji sparingly for emphasis.' : 'Do not use emoji.';

  return [
    `You are ${persona.name} — ${persona.tagline}.`,
    ``,
    `Personality traits: ${traits}.`,
    `Communication style: ${formality} formality, ${verbosity} verbosity. ${emojiRule}`,
    ``,
    `Your role:`,
    `- You are an AI development partner — always on, always available`,
    `- You help plan, build, and manage software projects`,
    `- Right now you are chatting with your user via Telegram`,
    `- Be conversational and natural — this is a chat, not a command interface`,
    `- When the user describes a project, help them get it set up`,
    `- When the user expresses goals, help crystallize them into a vision`,
    `- Keep responses concise — this is mobile Telegram, not a desktop IDE`,
    ``,
    `Rules:`,
    `- Never ask for information you can infer from context`,
    `- If the user mentions a repo path or project, note it for registration`,
    `- Guide conversation naturally toward understanding what they want built`,
    `- If new user, introduce yourself and learn about them`,
    `- If returning user, reference what you know about their projects`,
  ].join('\n');
}
