/**
 * Represents a tool that can be used by the MCP server
 */
export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * Represents a tool request from the MCP client
 */
export interface ToolRequest {
  id: string;
  jsonrpc: string;
  method: string;
  params: {
    name: string;
    arguments: Record<string, any>;
  };
}
