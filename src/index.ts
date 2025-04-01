#!/usr/bin/env node

import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

// Load .env file from the project root
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env") });

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Request } from "@modelcontextprotocol/sdk/types.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { LinearClient } from "@linear/sdk";
import { READ_TOOLS, WRITE_TOOLS } from "./tools/definitions.js";
import { ToolHandlers } from "./tools/handlers.js";
import { ToolRequest } from "./types.js";

// Environment variables
const API_KEY = process.env.LINEAR_API_KEY;
const READ_ONLY_MODE = process.env.LINEAR_MCP_READ_ONLY === "true";

if (!API_KEY) {
  console.error("Error: LINEAR_API_KEY environment variable is required");
  console.error("");
  console.error("To use this tool, run it with your Linear API key:");
  console.error("LINEAR_API_KEY=your-api-key npx @ibraheem4/linear-mcp");
  console.error("");
  console.error("Or set it in your environment:");
  console.error("export LINEAR_API_KEY=your-api-key");
  console.error("npx @ibraheem4/linear-mcp");
  process.exit(1);
}

// Initialize Linear client
const linearClient = new LinearClient({
  apiKey: API_KEY,
});

// Create a map of available tools based on read-only mode
const availableTools = {
  ...Object.fromEntries(READ_TOOLS.map((tool) => [tool.name, true])),
  ...(!READ_ONLY_MODE
    ? Object.fromEntries(WRITE_TOOLS.map((tool) => [tool.name, true]))
    : {}),
};

// Initialize server with available tools
const server = new Server(
  {
    name: "linear-mcp",
    version: "38.0.0",
  },
  {
    capabilities: {
      tools: availableTools,
    },
  },
);

/**
 * Rate Limiting and Usage Patterns
 *
 * The Linear API is subject to rate limiting. When making multiple API calls, consider:
 *
 * 1. Batching: Where possible, batch operations to minimize API calls
 * 2. Caching: Cache results that don't change frequently
 * 3. Pagination: Use appropriate page sizes and limit requests
 * 4. Error Handling: Always handle rate limit errors gracefully
 *
 * Linear API rate limits (as of 2024):
 * - Basic: 60 requests per minute
 * - Query complexity limits also apply
 *
 * When a rate limit is exceeded, the API returns a 429 Too Many Requests response.
 * For more details, see: https://developers.linear.app/docs/graphql/working-with-the-graphql-api/rate-limiting
 */

// Initialize tool handlers
const toolHandlers = new ToolHandlers(linearClient);

// Handle tool listing requests
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: READ_ONLY_MODE ? READ_TOOLS : [...READ_TOOLS, ...WRITE_TOOLS],
}));

// Handle tool execution requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // No logging - would break STDIO communication

  switch (request.params.name) {
    // Issue operations
    case "create_issue":
      return toolHandlers.handleCreateIssue(request);
    case "list_issues":
      return toolHandlers.handleListIssues(request);
    case "get_issue":
      return toolHandlers.handleGetIssue(request);
    case "search_issues":
      return toolHandlers.handleSearchIssues(request);
    case "update_issue":
      return toolHandlers.handleUpdateIssue(request);

    // Team operations
    case "list_teams":
      return toolHandlers.handleListTeams(request);
    case "get_team":
      return toolHandlers.handleGetTeam(request);

    // Project operations
    case "list_projects":
      return toolHandlers.handleListProjects(request);
    case "get_project":
      return toolHandlers.handleGetProject(request);

    // Roadmap operations
    case "list_roadmaps":
      return toolHandlers.handleListRoadmaps(request);
    case "get_roadmap":
      return toolHandlers.handleGetRoadmap(request);

    // Initiative operations
    case "get_initiative":
      return toolHandlers.handleGetInitiative(request);

    // Comment operations
    case "create_comment":
      return toolHandlers.handleCreateComment(request);
    case "get_comment":
      return toolHandlers.handleGetComment(request);
    case "update_comment":
      return toolHandlers.handleUpdateComment(request);
    case "delete_comment":
      return toolHandlers.handleDeleteComment(request);

    // Label operations
    case "list_labels":
      return toolHandlers.handleListLabels(request);
    case "get_label":
      return toolHandlers.handleGetLabel(request);
    case "create_label":
      return toolHandlers.handleCreateLabel(request);
    case "update_label":
      return toolHandlers.handleUpdateLabel(request);

    // Cycle operations
    case "list_cycles":
      return toolHandlers.handleListCycles(request);
    case "get_cycle":
      return toolHandlers.handleGetCycle(request);
    case "create_cycle":
      return toolHandlers.handleCreateCycle(request);
    case "update_cycle":
      return toolHandlers.handleUpdateCycle(request);

    // Document operations
    case "list_documents":
      return toolHandlers.handleListDocuments(request);
    case "get_document":
      return toolHandlers.handleGetDocument(request);
    case "create_document":
      return toolHandlers.handleCreateDocument(request);
    case "update_document":
      return toolHandlers.handleUpdateDocument(request);

    // User operations
    case "list_users":
      return toolHandlers.handleListUsers(request);
    case "get_user":
      return toolHandlers.handleGetUser(request);
    case "me":
      return toolHandlers.handleMe();

    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Linear MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
