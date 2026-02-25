import OpenAI from 'openai';
import type { Logger } from 'pino';
import type { DaemonConfig } from '../core/config.js';
import type { ConversationMemory } from './memory.js';
import type { PersonaConfig } from './persona.js';
import type { BudgetTracker } from '../budget/tracker.js';
import type { ProjectManager } from '../db/projects.js';
import { detectCommitments } from '../commitment/detector.js';
import type { DetectedCommitment, CommitmentLLMClient } from '../commitment/detector.js';
import type { ToolRegistry } from '../tools/index.js';
import {
  BrainStateManager,
  getPhasePrompt,
  buildDiscoveryContext,
  detectTransition,
} from './brain-runtime.js';
import type { ConversationPhase, DiscoveryData } from './brain-runtime.js';

// ---------------------------------------------------------------------------
// Intent Classification (lightweight, $0 — no LLM call)
// ---------------------------------------------------------------------------

export type MessageIntent =
  | 'project_description'  // User describing a project or repo
  | 'vision_statement'     // User expressing goals/direction
  | 'help_request'         // User asking for help with something
  | 'status_query'         // User asking about daemon/project status
  | 'casual_chat'          // General conversation
  | 'command';             // Explicit command (fallback to bot commands)

export function classifyIntent(text: string): MessageIntent {
  const lower = text.toLowerCase().trim();
  if (lower.startsWith('/')) return 'command';
  if ([/(?:working on|building|creating|developing|my project|my repo|my app)/,
       /(?:github\.com|gitlab\.com|bitbucket\.org)/,
       /(?:repo(?:sitory)?|codebase|workspace).*(?:at|in|is)/,
       /(?:c:|d:|\/home\/|\/users\/|~\/).*(?:\.git|src|package\.json)/i,
  ].some(p => p.test(lower))) return 'project_description';
  if ([/(?:i want|i need|i'd like|goal is|vision is|plan is|idea is)/,
       /(?:should be able to|needs to|must be able to)/,
       /(?:the end result|ultimately|the product should|the app should)/,
  ].some(p => p.test(lower))) return 'vision_statement';
  if ([/(?:help me|can you|how do i|how to|what's the best way)/,
       /(?:stuck on|struggling with|having trouble|can't figure)/,
  ].some(p => p.test(lower))) return 'help_request';
  if ([/(?:status|progress|how's it going|what are you doing|what did you do)/,
       /(?:update|report|results|anything new)/,
  ].some(p => p.test(lower))) return 'status_query';
  return 'casual_chat';
}

// ---------------------------------------------------------------------------
// Conversation Handler — routes through Brain Runtime
// ---------------------------------------------------------------------------

export interface ConversationResponse {
  text: string;
  intent: MessageIntent;
  phase: ConversationPhase;
  extractedProject?: { name: string; path: string };
  detectedCommitments?: DetectedCommitment[];
  inputTokens: number;
  outputTokens: number;
}

const GITHUB_MODELS_BASE_URL = 'https://models.github.ai/inference';

export class ConversationHandler {
  private client: OpenAI;
  private model: string;
  private brainState: BrainStateManager;
  private toolRegistry: ToolRegistry | null = null;

  constructor(
    config: DaemonConfig,
    private _persona: PersonaConfig,
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
      throw new Error('No LLM provider available for conversation.');
    }

    // Initialize brain state manager (uses same DB as conversation memory)
    this.brainState = new BrainStateManager(this.memory.getDb(), this.logger);

    // If there are existing projects, start in active phase
    const projects = this.projectManager.listProjects();
    if (projects.length > 0) {
      const state = this.brainState.getState();
      if (state.phase === 'greeting') {
        this.brainState.updateState('active', state.discoveryData);
      }
    }
  }

  /**
   * Handle an incoming user message through the Brain Runtime.
   * The runtime tracks which phase of Mother Brain's process we're in
   * and constrains the LLM to follow that phase's rules.
   */
  async handleMessage(userMessage: string): Promise<ConversationResponse> {
    const intent = classifyIntent(userMessage);
    this.memory.addMessage('user', userMessage, intent);

    // Get current brain state
    let state = this.brainState.getState();

    // Extract entities from user message and update discovery data
    const updatedData = this.extractEntities(userMessage, state.discoveryData);

    // Check for phase transition
    const newPhase = detectTransition(state.phase, userMessage, updatedData);
    if (newPhase) {
      this.logger.info({ from: state.phase, to: newPhase }, 'Phase transition');
      this.brainState.updateState(newPhase, updatedData);
      state = { phase: newPhase, discoveryData: updatedData, updatedAt: new Date().toISOString() };
    } else {
      // Update discovery data without phase change
      this.brainState.updateState(state.phase, updatedData);
    }

    // Increment questions counter
    this.brainState.incrementQuestions(state);

    // Build phase-specific system prompt
    const systemPrompt = this.buildPhasePrompt(state.phase, updatedData);

    // Get conversation context — enough history for continuity
    const messages = this.memory.buildLLMContext(systemPrompt, 12);

    this.logger.debug(
      { phase: state.phase, intent, messageCount: messages.length },
      'Processing message through brain runtime',
    );

    // Call LLM with constrained prompt — handle content filter errors
    // If tools are available, include them and handle tool-call responses.
    let reply: string;
    let inputTokens = 0;
    let outputTokens = 0;

    const openAITools = this.toolRegistry && this.toolRegistry.size > 0
      ? this.toolRegistry.toOpenAITools() as OpenAI.ChatCompletionTool[]
      : undefined;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: 512,
        messages: messages as OpenAI.ChatCompletionMessageParam[],
        ...(openAITools ? { tools: openAITools } : {}),
      });

      inputTokens += response.usage?.prompt_tokens ?? 0;
      outputTokens += response.usage?.completion_tokens ?? 0;
      const choice = response.choices[0];

      // Tool-use loop: execute tool calls and let LLM generate final answer
      if (choice?.finish_reason === 'tool_calls' && choice.message.tool_calls?.length && this.toolRegistry) {
        const toolMessages: OpenAI.ChatCompletionMessageParam[] = [
          ...messages as OpenAI.ChatCompletionMessageParam[],
          choice.message as OpenAI.ChatCompletionAssistantMessageParam,
        ];

        for (const toolCall of choice.message.tool_calls) {
          const toolName = toolCall.function.name;
          let args: Record<string, unknown> = {};
          try { args = JSON.parse(toolCall.function.arguments); } catch { /* empty args */ }

          this.logger.info({ tool: toolName, args }, 'Executing tool call from LLM');
          const result = await this.toolRegistry.execute(toolName, args, this.logger);

          toolMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: result.success
              ? JSON.stringify(result.output)
              : `Error: ${result.error ?? 'Unknown error'}`,
          });
        }

        // Second LLM call to generate final text response using tool results
        const followUp = await this.client.chat.completions.create({
          model: this.model,
          max_tokens: 512,
          messages: toolMessages,
        });

        inputTokens += followUp.usage?.prompt_tokens ?? 0;
        outputTokens += followUp.usage?.completion_tokens ?? 0;
        reply = followUp.choices[0]?.message?.content ?? "I ran those tools but couldn't summarize the results.";
      } else {
        reply = choice?.message?.content ?? "Let me think about that...";
      }
    } catch (error: unknown) {
      // Handle Azure content filter or other API errors gracefully
      const errorCode = (error as { code?: string })?.code;
      if (errorCode === 'content_filter') {
        this.logger.warn({ error: errorCode }, 'Content filter triggered — sending graceful response');
        reply = "I understand! Let me think about the best way to approach that. Could you tell me a bit more about what you'd like to focus on?";
      } else {
        throw error;
      }
    }

    this.memory.addMessage('assistant', reply, intent);

    // Two-stage commitment detection: regex filter → LLM classification
    const commitmentLLM: CommitmentLLMClient = { client: this.client, model: this.model };
    const detectedCommitments = await detectCommitments(reply, this.logger, commitmentLLM);

    // Record token usage
    if (this.budgetTracker && this.sessionId && (inputTokens > 0 || outputTokens > 0)) {
      const activeProject = this.projectManager.getActiveProject();
      this.budgetTracker.recordUsage(
        this.sessionId, 'copilot', this.model, inputTokens, outputTokens,
        'chat', activeProject?.id,
      );
    }

    this.logger.info(
      { phase: state.phase, intent, inputTokens, outputTokens },
      'Brain runtime response generated',
    );

    return {
      text: reply,
      intent,
      phase: state.phase,
      detectedCommitments: detectedCommitments.length > 0 ? detectedCommitments : undefined,
      inputTokens,
      outputTokens,
    };
  }

  /** Check if the user is new (no conversation history). */
  isNewUser(): boolean {
    return this.memory.isNewUser();
  }

  /** Get the greeting message (no LLM call). */
  getGreeting(): string {
    return this._persona.greeting;
  }

  /** Get current phase for status reporting. */
  getCurrentPhase(): ConversationPhase {
    return this.brainState.getState().phase;
  }

  /** Reset conversation state to start fresh. */
  resetConversation(): void {
    this.brainState.reset();
    this.logger.info('Conversation state reset by user');
  }

  /** Attach a tool registry for function-calling in conversations. */
  setToolRegistry(registry: ToolRegistry): void {
    this.toolRegistry = registry;
    this.logger.info({ tools: registry.size }, 'Tool registry attached to conversation handler');
  }

  // -------------------------------------------------------------------------
  // Private
  // -------------------------------------------------------------------------

  /** Build phase-aware system prompt with project context. */
  private buildPhasePrompt(phase: ConversationPhase, data: DiscoveryData): string {
    let prompt = getPhasePrompt(phase);

    // Add discovery context
    prompt += buildDiscoveryContext(data);

    // Add project context for active phase
    if (phase === 'active') {
      const projects = this.projectManager.listProjects();
      if (projects.length > 0) {
        const projectList = projects
          .map(p => `- ${p.name}${p.active ? ' [ACTIVE]' : ''}: ${p.repoPath}`)
          .join('\n');
        prompt += `\n\nRegistered projects:\n${projectList}`;
      }

      // Append tool manifest so the LLM knows what tools are available
      if (this.toolRegistry && this.toolRegistry.size > 0) {
        prompt += `\n\nAVAILABLE TOOLS:\n${this.toolRegistry.generateManifest()}`;
        prompt += '\nYou may call these tools via function calling when the user asks you to perform actions.';
      }
    }

    return prompt;
  }

  /** Extract project entities from user message to build discovery data. */
  private extractEntities(message: string, current: DiscoveryData): DiscoveryData {
    const updated = { ...current, userNeeds: [...current.userNeeds], visionNotes: [...current.visionNotes] };

    // Extract project name (heuristic)
    const nameMatch = message.match(/(?:called|named|it's|project is)\s+"?([A-Za-z][\w-]*)"?/i)
      ?? message.match(/(?:working on|building)\s+"?([A-Za-z][\w-]*)"?/i);
    if (nameMatch && !updated.projectName) {
      updated.projectName = nameMatch[1];
    }

    // Extract paths
    const pathMatch = message.match(/((?:[A-Z]:\\|\/home\/|\/Users\/|~\/)\S+)/);
    if (pathMatch && !updated.projectPath) {
      updated.projectPath = pathMatch[1];
    }

    // Extract GitHub URLs
    const githubMatch = message.match(/(https?:\/\/github\.com\/\S+)/i);
    if (githubMatch && !updated.projectPath) {
      updated.projectPath = githubMatch[1];
    }

    // Extract user needs (vision-level statements)
    const needPatterns = [
      /(?:i want|i need|should be able to|must be able to|needs to)\s+(.{10,80})/i,
      /(?:ability to|able to)\s+(.{10,60})/i,
    ];
    for (const pattern of needPatterns) {
      const match = message.match(pattern);
      if (match && !updated.userNeeds.includes(match[1])) {
        updated.userNeeds.push(match[1].trim());
      }
    }

    return updated;
  }
}
