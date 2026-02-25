import type { Logger } from 'pino';
import type {
  Tool,
  ToolDefinition,
  ToolResult,
  ToolInputSchema,
  OpenAITool,
  ParameterSchema,
} from './types.js';

// ---------------------------------------------------------------------------
// Tool Registry — Typed tool management with manifest generation
// ---------------------------------------------------------------------------

export class ToolRegistry {
  private tools = new Map<string, Tool>();

  constructor(private logger: Logger) {}

  /** Register a tool. Overwrites if name already exists. */
  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
    this.logger.info({ tool: tool.name, risk: tool.riskLevel, builtin: tool.builtin }, 'Tool registered');
  }

  /** Unregister a tool by name. */
  unregister(name: string): boolean {
    const removed = this.tools.delete(name);
    if (removed) this.logger.info({ tool: name }, 'Tool unregistered');
    return removed;
  }

  /** Get a tool by name. */
  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /** List all registered tools. */
  list(): Tool[] {
    return Array.from(this.tools.values());
  }

  /** List serializable tool definitions (no execute function). */
  listDefinitions(): ToolDefinition[] {
    return this.list().map(({ execute, ...def }) => def);
  }

  /** Check if a tool exists. */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /** Total number of registered tools. */
  get size(): number {
    return this.tools.size;
  }

  // -------------------------------------------------------------------------
  // Manifest Generation
  // -------------------------------------------------------------------------

  /**
   * Generate a text manifest for system prompts.
   * The LLM reads this to know what tools are available.
   */
  generateManifest(): string {
    if (this.tools.size === 0) return 'No tools available.';

    const lines: string[] = ['Available tools:'];
    for (const tool of this.tools.values()) {
      const params = Object.entries(tool.inputSchema.parameters)
        .map(([name, schema]) => {
          const req = schema.required ? ' (required)' : ' (optional)';
          return `    - ${name}: ${schema.type}${req} — ${schema.description}`;
        })
        .join('\n');
      lines.push(`\n- **${tool.name}**: ${tool.description} [risk: ${tool.riskLevel}]\n  Parameters:\n${params}`);
    }
    return lines.join('\n');
  }

  /**
   * Convert all tools to OpenAI function-calling format.
   * Used when passing tools to the LLM API.
   */
  toOpenAITools(): OpenAITool[] {
    return this.list().map(tool => toOpenAITool(tool));
  }

  // -------------------------------------------------------------------------
  // Execution
  // -------------------------------------------------------------------------

  /**
   * Execute a tool by name with the given parameters.
   * Validates inputs against the schema before execution.
   */
  async execute(name: string, params: Record<string, unknown>): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return { success: false, output: null, error: `Tool not found: ${name}`, durationMs: 0 };
    }

    // Validate required parameters
    const validationError = validateParams(params, tool.inputSchema);
    if (validationError) {
      return { success: false, output: null, error: validationError, durationMs: 0 };
    }

    const start = Date.now();
    try {
      const result = await tool.execute(params);
      this.logger.info(
        { tool: name, success: result.success, durationMs: result.durationMs },
        'Tool executed',
      );
      return result;
    } catch (error) {
      const durationMs = Date.now() - start;
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error({ tool: name, error: errorMsg, durationMs }, 'Tool execution failed');
      return { success: false, output: null, error: errorMsg, durationMs };
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validateParams(params: Record<string, unknown>, schema: ToolInputSchema): string | null {
  for (const [name, paramSchema] of Object.entries(schema.parameters)) {
    if (paramSchema.required && (params[name] === undefined || params[name] === null)) {
      return `Missing required parameter: ${name}`;
    }
    if (params[name] !== undefined && paramSchema.enum && !paramSchema.enum.includes(String(params[name]))) {
      return `Invalid value for ${name}: must be one of ${paramSchema.enum.join(', ')}`;
    }
  }
  return null;
}

function toOpenAITool(tool: Tool): OpenAITool {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const [name, schema] of Object.entries(tool.inputSchema.parameters)) {
    properties[name] = schemaToOpenAI(schema);
    if (schema.required) required.push(name);
  }

  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object',
        properties,
        required,
      },
    },
  };
}

function schemaToOpenAI(schema: ParameterSchema): Record<string, unknown> {
  const result: Record<string, unknown> = {
    type: schema.type,
    description: schema.description,
  };
  if (schema.enum) result.enum = schema.enum;
  if (schema.items) result.items = schemaToOpenAI(schema.items);
  if (schema.properties) {
    result.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([k, v]) => [k, schemaToOpenAI(v)]),
    );
  }
  return result;
}
