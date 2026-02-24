import OpenAI from 'openai';
import type { Logger } from 'pino';
import type { DaemonConfig } from '../core/config.js';
import type { ConversationMemory } from './memory.js';
import type { PersonaConfig } from './persona.js';
import { buildPersonaSystemPrompt } from './persona.js';
import type { BudgetTracker } from '../budget/tracker.js';
import type { ProjectManager } from '../db/projects.js';

// ---------------------------------------------------------------------------
// Intent Classification
// ---------------------------------------------------------------------------

export type MessageIntent =
  | 'project_description'  // User describing a project or repo
  | 'vision_statement'     // User expressing goals/direction
  | 'help_request'         // User asking for help with something
  | 'status_query'         // User asking about daemon/project status
  | 'casual_chat'          // General conversation
  | 'command';             // Explicit command (fallback to bot commands)

/**
 * Classify user intent using keyword patterns.
 * This is the $0 classification layer — no LLM calls needed.
 */
export function classifyIntent(text: string): MessageIntent {
  const lower = text.toLowerCase().trim();

  // Command-like messages
  if (lower.startsWith('/')) return 'command';

  // Project description patterns
  const projectPatterns = [
    /(?:working on|building|creating|developing|my project|my repo|my app)/,
    /(?:github\.com|gitlab\.com|bitbucket\.org)/,
    /(?:repo(?:sitory)?|codebase|workspace).*(?:at|in|is)/,
    /(?:c:|d:|\/home\/|\/users\/|~\/).*(?:\.git|src|package\.json)/i,
  ];
  if (projectPatterns.some(p => p.test(lower))) return 'project_description';

  // Vision/goal patterns
  const visionPatterns = [
    /(?:i want|i need|i'd like|goal is|vision is|plan is|idea is)/,
    /(?:should be able to|needs to|must be able to)/,
    /(?:the end result|ultimately|the product should|the app should)/,
    /(?:imagine|picture this|what if|how about)/,
  ];
  if (visionPatterns.some(p => p.test(lower))) return 'vision_statement';

  // Help request patterns
  const helpPatterns = [
    /(?:help me|can you|how do i|how to|what's the best way)/,
    /(?:stuck on|struggling with|having trouble|can't figure)/,
    /(?:fix|debug|solve|resolve)/,
  ];
  if (helpPatterns.some(p => p.test(lower))) return 'help_request';

  // Status query patterns
  const statusPatterns = [
    /(?:status|progress|how's it going|what are you doing|what did you do)/,
    /(?:update|report|results|anything new)/,
  ];
  if (statusPatterns.some(p => p.test(lower))) return 'status_query';

  return 'casual_chat';
}

// ---------------------------------------------------------------------------
// Conversation Handler — processes natural language messages
// ---------------------------------------------------------------------------

export interface ConversationResponse {
  text: string;
  intent: MessageIntent;
  extractedProject?: { name: string; path: string };
  inputTokens: number;
  outputTokens: number;
}

const GITHUB_MODELS_BASE_URL = 'https://models.github.ai/inference';

export class ConversationHandler {
  private client: OpenAI;
  private model: string;

  constructor(
    config: DaemonConfig,
    private persona: PersonaConfig,
    private memory: ConversationMemory,
    private projectManager: ProjectManager,
    private logger: Logger,
    private budgetTracker?: BudgetTracker,
    private sessionId?: string,
  ) {
    const chatTier = config.llm.tiers?.chat;
    const githubToken = config.llm.githubToken ?? config.llm.copilot?.githubToken;

    if (chatTier && chatTier.provider === 'copilot' && githubToken) {
      this.client = new OpenAI({
        baseURL: GITHUB_MODELS_BASE_URL,
        apiKey: githubToken,
      });
      this.model = chatTier.model;
    } else if (githubToken) {
      this.client = new OpenAI({
        baseURL: GITHUB_MODELS_BASE_URL,
        apiKey: githubToken,
      });
      this.model = config.llm.copilot?.model ?? 'openai/gpt-4.1';
    } else {
      throw new Error('No LLM provider available for conversation. Configure llm.tiers.chat or llm.copilot.');
    }
  }

  /**
   * Handle an incoming user message.
   * Classifies intent, builds context, calls LLM, stores in memory.
   */
  async handleMessage(userMessage: string): Promise<ConversationResponse> {
    const intent = classifyIntent(userMessage);

    // Store user message
    this.memory.addMessage('user', userMessage, intent);

    // Build context-aware system prompt
    const systemPrompt = this.buildContextualPrompt(intent);

    // Get conversation context (system + recent history)
    const messages = this.memory.buildLLMContext(systemPrompt, 10);

    this.logger.debug({ intent, messageCount: messages.length }, 'Processing conversation');

    // Call LLM
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: 1024,
      messages: messages as OpenAI.ChatCompletionMessageParam[],
    });

    const reply = response.choices[0]?.message?.content ?? "I'm not sure how to respond to that.";
    const inputTokens = response.usage?.prompt_tokens ?? 0;
    const outputTokens = response.usage?.completion_tokens ?? 0;

    // Store assistant response
    this.memory.addMessage('assistant', reply, intent);

    // Record token usage in budget tracker
    if (this.budgetTracker && this.sessionId) {
      const activeProject = this.projectManager.getActiveProject();
      this.budgetTracker.recordUsage(
        this.sessionId, 'copilot', this.model, inputTokens, outputTokens,
        'chat', activeProject?.id,
      );
    }

    this.logger.info(
      { intent, inputTokens, outputTokens, model: this.model },
      'Conversation response generated',
    );

    return {
      text: reply,
      intent,
      inputTokens,
      outputTokens,
    };
  }

  /** Check if the user is new (no conversation history). */
  isNewUser(): boolean {
    return this.memory.isNewUser();
  }

  /** Get the greeting message (no LLM call needed). */
  getGreeting(): string {
    return this.memory.isNewUser()
      ? this.persona.greeting
      : this.persona.returningGreeting;
  }

  private buildContextualPrompt(intent: MessageIntent): string {
    const base = buildPersonaSystemPrompt(this.persona);

    // Add project context
    const projects = this.projectManager.listProjects();
    let projectContext = '';
    if (projects.length > 0) {
      const projectList = projects
        .map(p => `- ${p.name} (${p.repoPath})${p.active ? ' [ACTIVE]' : ''}`)
        .join('\n');
      projectContext = `\n\nKnown projects:\n${projectList}`;
    } else {
      projectContext = '\n\nNo projects registered yet. Help the user get their first project set up.';
    }

    // Add intent-specific guidance
    let intentGuide = '';
    switch (intent) {
      case 'project_description':
        intentGuide = '\n\nThe user is describing a project. Listen carefully for repo paths, project names, and what the project does. Ask clarifying questions to understand the project better before suggesting to register it.';
        break;
      case 'vision_statement':
        intentGuide = '\n\nThe user is expressing goals or vision. Help them crystallize these into clear outcomes. Ask what success looks like.';
        break;
      case 'help_request':
        intentGuide = '\n\nThe user needs help. Be practical and solution-oriented.';
        break;
      case 'status_query':
        intentGuide = '\n\nThe user is asking about status. Reference known projects and recent activity.';
        break;
      case 'casual_chat':
        intentGuide = '\n\nThis is casual conversation. Be friendly and natural. If appropriate, steer toward understanding their projects.';
        break;
    }

    return base + projectContext + intentGuide;
  }
}
