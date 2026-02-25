// ---------------------------------------------------------------------------
// Tool System — Type Definitions
// ---------------------------------------------------------------------------
// Every tool the daemon can use has a typed schema: name, description,
// input parameters, and output format. This enables the LLM to discover
// and invoke tools via structured function calling.
// ---------------------------------------------------------------------------

/** JSON Schema subset for tool parameter definitions. */
export interface ParameterSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  enum?: string[];
  items?: ParameterSchema;
  properties?: Record<string, ParameterSchema>;
}

/** Complete schema for a tool's inputs. */
export interface ToolInputSchema {
  parameters: Record<string, ParameterSchema>;
}

/** Tool execution result. */
export interface ToolResult {
  success: boolean;
  output: unknown;
  error?: string;
  /** Time taken in milliseconds. */
  durationMs: number;
}

/** Risk level for human-in-the-loop gating. */
export type ToolRiskLevel = 'low' | 'medium' | 'high';

/** A single tool that the daemon can invoke. */
export interface Tool {
  /** Unique identifier (kebab-case). */
  name: string;
  /** Human-readable description for the LLM. */
  description: string;
  /** Input parameter schema. */
  inputSchema: ToolInputSchema;
  /** Risk level: low = auto-execute, medium/high = require approval. */
  riskLevel: ToolRiskLevel;
  /** Whether this tool is a built-in or was dynamically registered. */
  builtin: boolean;
  /** Execute the tool with validated inputs. */
  execute: (params: Record<string, unknown>) => Promise<ToolResult>;
}

/** Serializable tool definition (without execute function). */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
  riskLevel: ToolRiskLevel;
  builtin: boolean;
}

/** OpenAI function-calling tool format. */
export interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required: string[];
    };
  };
}
