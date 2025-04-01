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
import {
  CreateIssueArgs,
  ListIssuesArgs,
  UpdateIssueArgs,
  ListProjectsArgs,
  SearchIssuesArgs,
  GetIssueArgs,
  ListRoadmapsArgs,
  GetInitiativeArgs,
  CreateCommentArgs,
  GetCommentArgs,
  UpdateCommentArgs,
  DeleteCommentArgs,
  ListLabelsArgs,
  CreateLabelArgs,
  UpdateLabelArgs,
  ListCyclesArgs,
  CreateCycleArgs,
  UpdateCycleArgs,
  ListDocumentsArgs,
  CreateDocumentArgs,
  UpdateDocumentArgs,
  ListUsersArgs,
  GetUserArgs,
  MeArgs,
  GetTeamArgs,
  GetProjectArgs,
  GetRoadmapArgs,
  GetLabelArgs,
  GetCycleArgs,
  GetDocumentArgs,
  // Zod schemas
  createIssueSchema,
  listIssuesSchema,
  updateIssueSchema,
  listProjectsSchema,
  searchIssuesSchema,
  getIssueSchema,
  listRoadmapsSchema,
  getInitiativeSchema,
  createCommentSchema,
  getCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
  listLabelsSchema,
  createLabelSchema,
  updateLabelSchema,
  listCyclesSchema,
  createCycleSchema,
  updateCycleSchema,
  listDocumentsSchema,
  createDocumentSchema,
  updateDocumentSchema,
  listUsersSchema,
  getUserSchema,
  meSchema,
  getTeamSchema,
  getProjectSchema,
  getRoadmapSchema,
  getLabelSchema,
  getCycleSchema,
  getDocumentSchema,
  // Utility functions
  validateRequest,
} from "./schemas/index.js";

const API_KEY = process.env.LINEAR_API_KEY || process.env.LINEARAPIKEY;
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

const linearClient = new LinearClient({
  apiKey: API_KEY,
});

const server = new Server(
  {
    name: "linear-mcp",
    version: "38.0.0", // Updated to match the current Linear SDK version
  },
  {
    capabilities: {
      tools: {
        create_issue: true,
        list_issues: true,
        update_issue: true,
        list_teams: true,
        get_team: true,
        list_projects: true,
        get_project: true,
        search_issues: true,
        get_issue: true,
        list_roadmaps: true,
        get_roadmap: true,
        get_initiative: true,
        // Comments
        create_comment: true,
        get_comment: true,
        update_comment: true,
        delete_comment: true,
        // Labels
        list_labels: true,
        get_label: true,
        create_label: true,
        update_label: true,
        // Cycles
        list_cycles: true,
        get_cycle: true,
        create_cycle: true,
        update_cycle: true,
        // Documents
        list_documents: true,
        get_document: true,
        create_document: true,
        update_document: true,
        // Users
        list_users: true,
        get_user: true,
        me: true,
      },
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

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "create_issue",
      description: "Create a new issue in Linear",
      inputSchema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Issue title",
          },
          description: {
            type: "string",
            description: "Issue description (markdown supported)",
          },
          teamId: {
            type: "string",
            description: "Team ID",
          },
          assigneeId: {
            type: "string",
            description: "Assignee user ID (optional)",
          },
          priority: {
            type: "number",
            description: "Priority (0-4, optional)",
            minimum: 0,
            maximum: 4,
          },
          labels: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Label IDs to apply (optional)",
          },
        },
        required: ["title", "teamId"],
      },
    },
    {
      name: "list_issues",
      description: "List issues with optional filters",
      inputSchema: {
        type: "object",
        properties: {
          teamId: {
            type: "string",
            description: "Filter by team ID (optional)",
          },
          assigneeId: {
            type: "string",
            description: "Filter by assignee ID (optional)",
          },
          status: {
            type: "string",
            description: "Filter by status (optional)",
          },
          projectId: {
            type: "string",
            description: "Filter by project ID (optional)",
          },
          creatorId: {
            type: "string",
            description: "Filter by creator ID (optional)",
          },
          priority: {
            type: "number",
            description: "Filter by priority (0-4, optional)",
            minimum: 0,
            maximum: 4,
          },
          dueDate: {
            type: "string",
            description: "Filter by exact due date (ISO format, optional)",
          },
          dueDateGte: {
            type: "string",
            description:
              "Filter by due date greater than or equal (ISO format, optional)",
          },
          dueDateLte: {
            type: "string",
            description:
              "Filter by due date less than or equal (ISO format, optional)",
          },
          createdAtGte: {
            type: "string",
            description:
              "Filter by created date greater than or equal (ISO format, optional)",
          },
          createdAtLte: {
            type: "string",
            description:
              "Filter by created date less than or equal (ISO format, optional)",
          },
          updatedAtGte: {
            type: "string",
            description:
              "Filter by updated date greater than or equal (ISO format, optional)",
          },
          updatedAtLte: {
            type: "string",
            description:
              "Filter by updated date less than or equal (ISO format, optional)",
          },
          completedAtGte: {
            type: "string",
            description:
              "Filter by completed date greater than or equal (ISO format, optional)",
          },
          completedAtLte: {
            type: "string",
            description:
              "Filter by completed date less than or equal (ISO format, optional)",
          },
          canceledAtGte: {
            type: "string",
            description:
              "Filter by canceled date greater than or equal (ISO format, optional)",
          },
          canceledAtLte: {
            type: "string",
            description:
              "Filter by canceled date less than or equal (ISO format, optional)",
          },
          startedAtGte: {
            type: "string",
            description:
              "Filter by started date greater than or equal (ISO format, optional)",
          },
          startedAtLte: {
            type: "string",
            description:
              "Filter by started date less than or equal (ISO format, optional)",
          },
          archivedAtGte: {
            type: "string",
            description:
              "Filter by archived date greater than or equal (ISO format, optional)",
          },
          archivedAtLte: {
            type: "string",
            description:
              "Filter by archived date less than or equal (ISO format, optional)",
          },
          title: {
            type: "string",
            description: "Filter by exact title match (optional)",
          },
          titleContains: {
            type: "string",
            description: "Filter by title containing text (optional)",
          },
          description: {
            type: "string",
            description: "Filter by exact description match (optional)",
          },
          descriptionContains: {
            type: "string",
            description: "Filter by description containing text (optional)",
          },
          number: {
            type: "number",
            description: "Filter by issue number (optional)",
          },
          labelIds: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Filter by label IDs (optional)",
          },
          cycleId: {
            type: "string",
            description: "Filter by cycle ID (optional)",
          },
          parentId: {
            type: "string",
            description: "Filter by parent issue ID (optional)",
          },
          estimate: {
            type: "number",
            description: "Filter by exact estimate value (optional)",
          },
          estimateGte: {
            type: "number",
            description: "Filter by estimate greater than or equal (optional)",
          },
          estimateLte: {
            type: "number",
            description: "Filter by estimate less than or equal (optional)",
          },
          isBlocked: {
            type: "boolean",
            description: "Filter issues that are blocked (optional)",
          },
          isBlocking: {
            type: "boolean",
            description:
              "Filter issues that are blocking other issues (optional)",
          },
          isDuplicate: {
            type: "boolean",
            description: "Filter issues that are duplicates (optional)",
          },
          hasRelations: {
            type: "boolean",
            description: "Filter issues that have relations (optional)",
          },
          subscriberIds: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Filter by subscriber user IDs (optional)",
          },
          includeArchived: {
            type: "boolean",
            description: "Include archived issues (default: false)",
          },
          orderBy: {
            type: "string",
            enum: ["createdAt", "updatedAt", "priority"],
            description: "Sort issues by field (optional)",
          },
          first: {
            type: "number",
            description: "Number of issues to return (default: 50)",
          },
        },
      },
    },
    {
      name: "update_issue",
      description: "Update an existing issue",
      inputSchema: {
        type: "object",
        properties: {
          issueId: {
            type: "string",
            description: "Issue ID",
          },
          title: {
            type: "string",
            description: "New title (optional)",
          },
          description: {
            type: "string",
            description: "New description (optional)",
          },
          status: {
            type: "string",
            description: "New status (optional)",
          },
          assigneeId: {
            type: "string",
            description: "New assignee ID (optional)",
          },
          priority: {
            type: "number",
            description: "New priority (0-4, optional)",
            minimum: 0,
            maximum: 4,
          },
        },
        required: ["issueId"],
      },
    },
    {
      name: "get_issue",
      description: "Get detailed information about a specific issue",
      inputSchema: {
        type: "object",
        properties: {
          issueId: {
            type: "string",
            description: "Issue ID",
          },
        },
        required: ["issueId"],
      },
    },
    {
      name: "search_issues",
      description: "Search for issues using a text query",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query text",
          },
          first: {
            type: "number",
            description: "Number of results to return (default: 50)",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "list_teams",
      description: "List all teams in the workspace",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "get_team",
      description: "Get detailed information about a specific team",
      inputSchema: {
        type: "object",
        properties: {
          teamId: {
            type: "string",
            description: "Team ID",
          },
        },
        required: ["teamId"],
      },
    },
    {
      name: "list_projects",
      description: "List all projects with optional filters",
      inputSchema: {
        type: "object",
        properties: {
          first: {
            type: "number",
            description: "Number of projects to return (default: 50)",
          },
          after: {
            type: "string",
            description:
              "Cursor for pagination - get projects after this cursor",
          },
          orderBy: {
            type: "string",
            enum: ["createdAt", "updatedAt"],
            description: "Sort projects by field (createdAt, updatedAt)",
          },
          teamId: {
            type: "string",
            description:
              "Filter by team ID - shows projects accessible to the specified team",
          },
          id: {
            type: "string",
            description: "Filter by project ID",
          },
          name: {
            type: "string",
            description: "Filter projects by name (supports partial matching)",
          },
          state: {
            type: "string",
            description:
              "Filter by project state (backlog, planned, started, paused, completed, canceled)",
          },
          health: {
            type: "string",
            enum: ["onTrack", "atRisk", "offTrack"],
            description: "Filter by project health status",
          },
          priority: {
            type: "number",
            description: "Filter by project priority (0-4)",
          },
          creatorId: {
            type: "string",
            description: "Filter by creator's user ID",
          },
          leadId: {
            type: "string",
            description: "Filter by project lead's user ID",
          },
          createdAfter: {
            type: "string",
            description: "Filter projects created after this date (ISO format)",
          },
          createdBefore: {
            type: "string",
            description:
              "Filter projects created before this date (ISO format)",
          },
          updatedAfter: {
            type: "string",
            description: "Filter projects updated after this date (ISO format)",
          },
          updatedBefore: {
            type: "string",
            description:
              "Filter projects updated before this date (ISO format)",
          },
          startDate: {
            type: "string",
            description: "Filter by project start date (ISO format)",
          },
          targetDate: {
            type: "string",
            description: "Filter by project target date (ISO format)",
          },
          completedAfter: {
            type: "string",
            description:
              "Filter projects completed after this date (ISO format)",
          },
          completedBefore: {
            type: "string",
            description:
              "Filter projects completed before this date (ISO format)",
          },
          canceledAfter: {
            type: "string",
            description:
              "Filter projects canceled after this date (ISO format)",
          },
          canceledBefore: {
            type: "string",
            description:
              "Filter projects canceled before this date (ISO format)",
          },
          hasBlocking: {
            type: "boolean",
            description: "Filter projects that are blocking other projects",
          },
          hasBlocked: {
            type: "boolean",
            description: "Filter projects that are blocked by other projects",
          },
        },
      },
    },
    {
      name: "get_project",
      description: "Get detailed information about a specific project",
      inputSchema: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
            description: "Project ID",
          },
        },
        required: ["projectId"],
      },
    },
    {
      name: "list_roadmaps",
      description: "List all roadmaps (previously called initiatives)",
      inputSchema: {
        type: "object",
        properties: {
          first: {
            type: "number",
            description:
              "Number of roadmaps to return from the beginning (default: 50)",
          },
          last: {
            type: "number",
            description:
              "Number of roadmaps to return from the end (alternative to first)",
          },
          after: {
            type: "string",
            description: "Cursor for forward pagination",
          },
          before: {
            type: "string",
            description: "Cursor for backward pagination",
          },
          includeArchived: {
            type: "boolean",
            description: "Include archived roadmaps (default: false)",
          },
          orderBy: {
            type: "string",
            description: "Sort roadmaps by field (createdAt, updatedAt)",
            enum: ["createdAt", "updatedAt"],
          },
          includeProjects: {
            type: "boolean",
            description: "Include project IDs in the response (default: false)",
          },
        },
      },
    },
    {
      name: "get_roadmap",
      description: "Get detailed information about a specific roadmap",
      inputSchema: {
        type: "object",
        properties: {
          roadmapId: {
            type: "string",
            description: "Roadmap ID",
          },
          includeProjects: {
            type: "boolean",
            description:
              "Include project details in the response (default: true)",
          },
          includeArchived: {
            type: "boolean",
            description: "Include archived projects (default: false)",
          },
        },
        required: ["roadmapId"],
      },
    },
    {
      name: "get_initiative",
      description: "Get detailed information about a specific initiative",
      inputSchema: {
        type: "object",
        properties: {
          initiativeId: {
            type: "string",
            description: "Initiative ID",
          },
        },
        required: ["initiativeId"],
      },
    },
    // Comments
    {
      name: "create_comment",
      description: "Create a new comment on an issue",
      inputSchema: {
        type: "object",
        properties: {
          issueId: {
            type: "string",
            description: "ID of the issue to comment on",
          },
          body: {
            type: "string",
            description: "Comment content (markdown supported)",
          },
        },
        required: ["issueId", "body"],
      },
    },
    {
      name: "get_comment",
      description: "Get a specific comment by ID",
      inputSchema: {
        type: "object",
        properties: {
          commentId: {
            type: "string",
            description: "Comment ID",
          },
        },
        required: ["commentId"],
      },
    },
    {
      name: "update_comment",
      description: "Update an existing comment",
      inputSchema: {
        type: "object",
        properties: {
          commentId: {
            type: "string",
            description: "Comment ID",
          },
          body: {
            type: "string",
            description: "Updated comment content (markdown supported)",
          },
        },
        required: ["commentId", "body"],
      },
    },
    {
      name: "delete_comment",
      description: "Delete a comment",
      inputSchema: {
        type: "object",
        properties: {
          commentId: {
            type: "string",
            description: "Comment ID",
          },
        },
        required: ["commentId"],
      },
    },
    // Labels
    {
      name: "list_labels",
      description: "List all labels in a team",
      inputSchema: {
        type: "object",
        properties: {
          teamId: {
            type: "string",
            description: "Team ID to list labels from (optional)",
          },
          first: {
            type: "number",
            description: "Number of labels to return (default: 50)",
          },
        },
      },
    },
    {
      name: "get_label",
      description: "Get detailed information about a specific label",
      inputSchema: {
        type: "object",
        properties: {
          labelId: {
            type: "string",
            description: "Label ID",
          },
        },
        required: ["labelId"],
      },
    },
    {
      name: "create_label",
      description: "Create a new label in a team",
      inputSchema: {
        type: "object",
        properties: {
          teamId: {
            type: "string",
            description: "Team ID where the label will be created",
          },
          name: {
            type: "string",
            description: "Label name",
          },
          color: {
            type: "string",
            description: "Label color (hex code, optional)",
          },
          description: {
            type: "string",
            description: "Label description (optional)",
          },
        },
        required: ["teamId", "name"],
      },
    },
    {
      name: "update_label",
      description: "Update an existing label",
      inputSchema: {
        type: "object",
        properties: {
          labelId: {
            type: "string",
            description: "Label ID",
          },
          name: {
            type: "string",
            description: "New label name (optional)",
          },
          color: {
            type: "string",
            description: "New label color (hex code, optional)",
          },
          description: {
            type: "string",
            description: "New label description (optional)",
          },
        },
        required: ["labelId"],
      },
    },
    // Cycles
    {
      name: "list_cycles",
      description: "List all cycles in a team",
      inputSchema: {
        type: "object",
        properties: {
          teamId: {
            type: "string",
            description: "Team ID (optional)",
          },
          first: {
            type: "number",
            description: "Number of cycles to return (default: 50)",
          },
        },
      },
    },
    {
      name: "get_cycle",
      description: "Get detailed information about a specific cycle",
      inputSchema: {
        type: "object",
        properties: {
          cycleId: {
            type: "string",
            description: "Cycle ID",
          },
          includeIssues: {
            type: "boolean",
            description:
              "Include issues in the cycle response (default: false)",
          },
          first: {
            type: "number",
            description:
              "Number of issues to return when includeIssues is true (default: 50, max: 100)",
          },
        },
        required: ["cycleId"],
      },
    },
    {
      name: "create_cycle",
      description: "Create a new cycle for a team",
      inputSchema: {
        type: "object",
        properties: {
          teamId: {
            type: "string",
            description: "Team ID",
          },
          name: {
            type: "string",
            description: "Cycle name",
          },
          description: {
            type: "string",
            description: "Cycle description (optional)",
          },
          startDate: {
            type: "string",
            description: "Cycle start date (ISO format, e.g. 2023-04-01)",
          },
          endDate: {
            type: "string",
            description: "Cycle end date (ISO format, e.g. 2023-04-15)",
          },
        },
        required: ["teamId", "name", "startDate", "endDate"],
      },
    },
    {
      name: "update_cycle",
      description: "Update an existing cycle",
      inputSchema: {
        type: "object",
        properties: {
          cycleId: {
            type: "string",
            description: "Cycle ID",
          },
          name: {
            type: "string",
            description: "New cycle name (optional)",
          },
          description: {
            type: "string",
            description: "New cycle description (optional)",
          },
          startDate: {
            type: "string",
            description: "New cycle start date (ISO format, optional)",
          },
          endDate: {
            type: "string",
            description: "New cycle end date (ISO format, optional)",
          },
        },
        required: ["cycleId"],
      },
    },
    // Documents
    {
      name: "list_documents",
      description: "List all documents",
      inputSchema: {
        type: "object",
        properties: {
          teamId: {
            type: "string",
            description: "Team ID to filter documents (optional)",
          },
          first: {
            type: "number",
            description: "Number of documents to return (default: 50)",
          },
        },
      },
    },
    {
      name: "get_document",
      description: "Get detailed information about a specific document",
      inputSchema: {
        type: "object",
        properties: {
          documentId: {
            type: "string",
            description: "Document ID",
          },
        },
        required: ["documentId"],
      },
    },
    {
      name: "create_document",
      description: "Create a new document",
      inputSchema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Document title",
          },
          content: {
            type: "string",
            description: "Document content (markdown supported)",
          },
          teamId: {
            type: "string",
            description: "Team ID the document belongs to",
          },
          projectId: {
            type: "string",
            description:
              "Project ID the document is associated with (optional)",
          },
        },
        required: ["title", "content", "teamId"],
      },
    },
    {
      name: "update_document",
      description: "Update an existing document",
      inputSchema: {
        type: "object",
        properties: {
          documentId: {
            type: "string",
            description: "Document ID",
          },
          title: {
            type: "string",
            description: "New document title (optional)",
          },
          content: {
            type: "string",
            description: "New document content (markdown supported, optional)",
          },
        },
        required: ["documentId"],
      },
    },
    // User tools
    {
      name: "list_users",
      description: "List all users in the workspace",
      inputSchema: {
        type: "object",
        properties: {
          first: {
            type: "number",
            description: "Number of users to return (default: 50)",
          },
        },
      },
    },
    {
      name: "get_user",
      description: "Get detailed information about a specific user",
      inputSchema: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description: "User ID",
          },
        },
        required: ["userId"],
      },
    },
    {
      name: "me",
      description: "Get information about the authenticated user",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ],
}));

/**
 * NOTE: All type definitions have been moved to src/schemas/index.ts
 * and are now imported at the top of this file.
 */

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    console.error(`Tool called: ${request.params.name}`);
    console.error(`Full request:`, JSON.stringify(request));

    switch (request.params.name) {
      case "create_issue": {
        // Use Zod schema for validation with the helper function
        const args = validateRequest(
          createIssueSchema,
          request.params.arguments,
        );

        const issue = await linearClient.createIssue({
          title: args.title,
          description: args.description,
          teamId: args.teamId,
          assigneeId: args.assigneeId,
          priority: args.priority,
          labelIds: args.labels,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(issue, null, 2),
            },
          ],
        };
      }

      case "list_issues": {
        // Use Zod schema for validation with the helper function
        const args = validateRequest(
          listIssuesSchema,
          request.params.arguments,
        );

        const filter: Record<string, any> = {};

        // Team filter
        if (args?.teamId) filter.team = { id: { eq: args.teamId } };

        // Assignee filter
        if (args?.assigneeId) filter.assignee = { id: { eq: args.assigneeId } };

        // Status filter (using state name)
        if (args?.status) filter.state = { name: { eq: args.status } };

        // Project filter
        if (args?.projectId) filter.project = { id: { eq: args.projectId } };

        // Creator filter
        if (args?.creatorId) filter.creator = { id: { eq: args.creatorId } };

        // Priority filter
        if (args?.priority !== undefined)
          filter.priority = { eq: args.priority };

        // Due date filters
        if (args?.dueDate || args?.dueDateGte || args?.dueDateLte) {
          filter.dueDate = {};
          if (args.dueDate) filter.dueDate.eq = args.dueDate;
          if (args.dueDateGte) filter.dueDate.gte = args.dueDateGte;
          if (args.dueDateLte) filter.dueDate.lte = args.dueDateLte;
        }

        // Created at filters
        if (args?.createdAtGte || args?.createdAtLte) {
          filter.createdAt = {};
          if (args.createdAtGte) filter.createdAt.gte = args.createdAtGte;
          if (args.createdAtLte) filter.createdAt.lte = args.createdAtLte;
        }

        // Updated at filters
        if (args?.updatedAtGte || args?.updatedAtLte) {
          filter.updatedAt = {};
          if (args.updatedAtGte) filter.updatedAt.gte = args.updatedAtGte;
          if (args.updatedAtLte) filter.updatedAt.lte = args.updatedAtLte;
        }

        // Completed at filters
        if (args?.completedAtGte || args?.completedAtLte) {
          filter.completedAt = {};
          if (args.completedAtGte) filter.completedAt.gte = args.completedAtGte;
          if (args.completedAtLte) filter.completedAt.lte = args.completedAtLte;
        }

        // Canceled at filters
        if (args?.canceledAtGte || args?.canceledAtLte) {
          filter.canceledAt = {};
          if (args.canceledAtGte) filter.canceledAt.gte = args.canceledAtGte;
          if (args.canceledAtLte) filter.canceledAt.lte = args.canceledAtLte;
        }

        // Started at filters
        if (args?.startedAtGte || args?.startedAtLte) {
          filter.startedAt = {};
          if (args.startedAtGte) filter.startedAt.gte = args.startedAtGte;
          if (args.startedAtLte) filter.startedAt.lte = args.startedAtLte;
        }

        // Archived at filters
        if (args?.archivedAtGte || args?.archivedAtLte) {
          filter.archivedAt = {};
          if (args.archivedAtGte) filter.archivedAt.gte = args.archivedAtGte;
          if (args.archivedAtLte) filter.archivedAt.lte = args.archivedAtLte;
        }

        // Title filters
        if (args?.title || args?.titleContains) {
          filter.title = {};
          if (args.title) filter.title.eq = args.title;
          if (args.titleContains) filter.title.contains = args.titleContains;
        }

        // Description filters
        if (args?.description || args?.descriptionContains) {
          filter.description = {};
          if (args.description) filter.description.eq = args.description;
          if (args.descriptionContains)
            filter.description.contains = args.descriptionContains;
        }

        // Number filter
        if (args?.number) filter.number = { eq: args.number };

        // Label filters
        if (args?.labelIds?.length) {
          filter.labels = { some: { id: { in: args.labelIds } } };
        }

        // Cycle filter
        if (args?.cycleId) filter.cycle = { id: { eq: args.cycleId } };

        // Parent filter
        if (args?.parentId) filter.parent = { id: { eq: args.parentId } };

        // Estimate filters
        if (
          args?.estimate !== undefined ||
          args?.estimateGte !== undefined ||
          args?.estimateLte !== undefined
        ) {
          filter.estimate = {};
          if (args.estimate !== undefined) filter.estimate.eq = args.estimate;
          if (args.estimateGte !== undefined)
            filter.estimate.gte = args.estimateGte;
          if (args.estimateLte !== undefined)
            filter.estimate.lte = args.estimateLte;
        }

        // Relationship filters
        if (args?.isBlocked) filter.hasBlockedByRelations = { exists: true };
        if (args?.isBlocking) filter.hasBlockingRelations = { exists: true };
        if (args?.isDuplicate) filter.hasDuplicateRelations = { exists: true };
        if (args?.hasRelations) filter.hasRelatedRelations = { exists: true };

        // Subscriber filters
        if (args?.subscriberIds?.length) {
          filter.subscribers = { some: { id: { in: args.subscriberIds } } };
        }

        // Prepare query options
        const queryOptions: any = {
          first: args?.first ?? 50,
          filter,
          includeArchived: args?.includeArchived || false,
        };

        // Add orderBy if specified
        if (args?.orderBy) {
          queryOptions.orderBy = args.orderBy;
        }

        const issues = await linearClient.issues(queryOptions);

        const formattedIssues = await Promise.all(
          issues.nodes.map(async (issue) => {
            // Fetch related data in parallel for performance
            const [
              state,
              assignee,
              project,
              team,
              creator,
              cycle,
              parent,
              labels,
            ] = await Promise.all([
              issue.state,
              issue.assignee,
              issue.project,
              issue.team,
              issue.creator,
              issue.cycle,
              issue.parent,
              issue.labels(),
            ]);

            // Process labels
            const labelsList = labels
              ? labels.nodes.map((label: any) => ({
                  id: label.id,
                  name: label.name,
                  color: label.color,
                }))
              : [];

            return {
              id: issue.id,
              identifier: issue.identifier,
              number: issue.number,
              title: issue.title,
              description: issue.description,

              // Status
              status: state
                ? {
                    id: state.id,
                    name: state.name,
                    type: state.type,
                    color: state.color,
                  }
                : null,

              // Relationships
              assignee: assignee
                ? {
                    id: assignee.id,
                    name: assignee.name,
                    email: assignee.email,
                  }
                : null,

              creator: creator
                ? {
                    id: creator.id,
                    name: creator.name,
                    email: creator.email,
                  }
                : null,

              project: project
                ? {
                    id: project.id,
                    name: project.name,
                    state: project.state,
                  }
                : null,

              team: team
                ? {
                    id: team.id,
                    name: team.name,
                    key: team.key,
                  }
                : null,

              cycle: cycle
                ? {
                    id: cycle.id,
                    name: cycle.name,
                    number: cycle.number,
                  }
                : null,

              parent: parent
                ? {
                    id: parent.id,
                    title: parent.title,
                    identifier: parent.identifier,
                  }
                : null,

              // Properties
              priority: issue.priority,
              priorityLabel: issue.priorityLabel,
              estimate: issue.estimate,
              sortOrder: issue.sortOrder,
              boardOrder: issue.boardOrder,
              subIssueSortOrder: issue.subIssueSortOrder,

              // URLs and external identifiers
              url: issue.url,
              branchName: issue.branchName,

              // Dates
              dueDate: issue.dueDate,
              createdAt: issue.createdAt,
              updatedAt: issue.updatedAt,
              startedAt: issue.startedAt,
              completedAt: issue.completedAt,
              canceledAt: issue.canceledAt,
              archivedAt: issue.archivedAt,
              autoArchivedAt: issue.autoArchivedAt,
              autoClosedAt: issue.autoClosedAt,
              triagedAt: issue.triagedAt,
              addedToCycleAt: issue.addedToCycleAt,
              addedToProjectAt: issue.addedToProjectAt,

              // SLA information
              slaStartedAt: issue.slaStartedAt,
              slaBreachesAt: issue.slaBreachesAt,
              slaMediumRiskAt: issue.slaMediumRiskAt,
              slaHighRiskAt: issue.slaHighRiskAt,
              slaType: issue.slaType,

              // Collections
              labels: labelsList,

              // Additional metadata
              customerTicketCount: issue.customerTicketCount,
              previousIdentifiers: issue.previousIdentifiers,
              snoozedUntilAt: issue.snoozedUntilAt,
              trashed: issue.trashed,
              reactionData: issue.reactionData,
            };
          }),
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(formattedIssues, null, 2),
            },
          ],
        };
      }

      case "update_issue": {
        // Use Zod schema for validation with the helper function
        const args = validateRequest(
          updateIssueSchema,
          request.params.arguments,
        );

        // Get the issue to update
        const issue = await linearClient.issue(args.issueId);

        if (!issue) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Issue with ID ${args.issueId} not found`,
          );
        }

        // Build update object
        const updateData: Record<string, any> = {};
        if (args.title) updateData.title = args.title;
        if (args.description !== undefined)
          updateData.description = args.description;
        if (args.status) {
          // Find workflow state by name
          const team = await issue.team;
          if (team) {
            const states = await team.states();
            const state = states.nodes.find(
              (s: any) => s.name.toLowerCase() === args.status!.toLowerCase(),
            );
            if (state) {
              updateData.stateId = state.id;
            } else {
              throw new McpError(
                ErrorCode.InvalidParams,
                `Status "${args.status}" not found in team workflow`,
              );
            }
          }
        }
        if (args.assigneeId !== undefined)
          updateData.assigneeId = args.assigneeId || null;
        if (args.priority !== undefined) updateData.priority = args.priority;
        if (args.labels) updateData.labelIds = args.labels;

        // Update issue
        const updatedIssue = await issue.update(updateData);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(updatedIssue, null, 2),
            },
          ],
        };
      }

      case "list_teams": {
        console.error("Handling list_teams request");
        try {
          console.error("Calling linearClient.teams()");
          // Get teams using the Linear SDK
          const teamsConnection = await linearClient.teams();
          console.error("Teams connection:", JSON.stringify(teamsConnection));

          // Access the nodes property which contains the actual team data
          const teams = teamsConnection.nodes;
          console.error("Teams nodes:", JSON.stringify(teams));

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(teams, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error listing teams:", error);
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to list teams: ${error.message}`,
          );
        }
      }

      case "list_projects": {
        const args = validateRequest(
          listProjectsSchema,
          request.params.arguments,
        );

        try {
          // Build filter object from args
          const filter: Record<string, any> = {};

          // Apply filters based on provided arguments
          if (args.teamId) filter.team = { id: { eq: args.teamId } };
          if (args.id) filter.id = { eq: args.id };
          if (args.name) filter.name = { eq: args.name };
          if (args.state) filter.state = { eq: args.state };
          if (args.health) filter.health = { eq: args.health };
          if (args.priority !== undefined)
            filter.priority = { eq: args.priority };
          if (args.creatorId) filter.creator = { id: { eq: args.creatorId } };
          if (args.leadId) filter.lead = { id: { eq: args.leadId } };

          // Date filters
          if (args.createdAfter || args.createdBefore) {
            filter.createdAt = {};
            if (args.createdAfter) filter.createdAt.gte = args.createdAfter;
            if (args.createdBefore) filter.createdAt.lte = args.createdBefore;
          }

          if (args.updatedAfter || args.updatedBefore) {
            filter.updatedAt = {};
            if (args.updatedAfter) filter.updatedAt.gte = args.updatedAfter;
            if (args.updatedBefore) filter.updatedAt.lte = args.updatedBefore;
          }

          if (args.startDate) filter.startDate = { eq: args.startDate };
          if (args.targetDate) filter.targetDate = { eq: args.targetDate };

          if (args.completedAfter || args.completedBefore) {
            filter.completedAt = {};
            if (args.completedAfter)
              filter.completedAt.gte = args.completedAfter;
            if (args.completedBefore)
              filter.completedAt.lte = args.completedBefore;
          }

          if (args.canceledAfter || args.canceledBefore) {
            filter.canceledAt = {};
            if (args.canceledAfter) filter.canceledAt.gte = args.canceledAfter;
            if (args.canceledBefore)
              filter.canceledAt.lte = args.canceledBefore;
          }

          // Relation filters
          if (args.hasBlocking) filter.hasBlockingIssues = { eq: true };
          if (args.hasBlocked) filter.hasBlockedIssues = { eq: true };

          // Prepare query options
          const queryVariables: any = {
            first: args?.first ?? 50,
            filter,
          };

          if (args?.after) queryVariables.after = args.after;
          if (args?.orderBy) queryVariables.orderBy = args.orderBy;

          try {
            // Use the SDK's projects method instead of raw GraphQL
            const projectsConnection =
              await linearClient.projects(queryVariables);

            // Process the projects data
            const projects = await Promise.all(
              projectsConnection.nodes.map(async (project) => {
                // Fetch related data for each project
                const [creator, lead, teams] = await Promise.all([
                  project.creator,
                  project.lead,
                  project.teams ? project.teams() : { nodes: [] },
                ]);

                return {
                  id: project.id,
                  name: project.name,
                  description: project.description,
                  state: project.state,
                  createdAt: project.createdAt,
                  updatedAt: project.updatedAt,
                  completedAt: project.completedAt || null,
                  canceledAt: project.canceledAt || null,
                  startDate: project.startDate || null,
                  targetDate: project.targetDate || null,
                  health: project.health || null,
                  priority:
                    project.priority !== undefined ? project.priority : null,
                  creator: creator
                    ? {
                        id: creator.id,
                        name: creator.name,
                        email: creator.email,
                      }
                    : null,
                  lead: lead
                    ? {
                        id: lead.id,
                        name: lead.name,
                        email: lead.email,
                      }
                    : null,
                  teams:
                    teams && teams.nodes
                      ? teams.nodes.map((team: any) => ({
                          id: team.id,
                          name: team.name,
                          key: team.key,
                        }))
                      : [],
                };
              }),
            );

            // Include pagination information
            const responseData = {
              projects,
              pageInfo: {
                hasNextPage: projectsConnection.pageInfo.hasNextPage,
                endCursor: projectsConnection.pageInfo.endCursor,
              },
            };

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(responseData, null, 2),
                },
              ],
            };
          } catch (error: any) {
            console.error("Error listing projects:", error);
            throw new McpError(
              ErrorCode.InternalError,
              `Failed to list projects: ${error.message}`,
            );
          }
        } catch (error: any) {
          console.error("Error listing projects:", error);
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to list projects: ${error.message}`,
          );
        }
      }

      case "search_issues": {
        const args = validateRequest(
          searchIssuesSchema,
          request.params.arguments,
        );

        try {
          // Prepare query options
          const queryVariables = {
            first: args.first ?? 50,
            query: args.query,
          };

          // Execute search
          const issues = await linearClient.issueSearch(queryVariables);

          // Process and format the results
          const formattedIssues = await Promise.all(
            issues.nodes.map(async (issue) => {
              // Fetch related data in parallel for performance
              const [state, assignee, team, project] = await Promise.all([
                issue.state,
                issue.assignee,
                issue.team,
                issue.project,
              ]);

              // Format the issue
              return {
                id: issue.id,
                title: issue.title,
                description: issue.description,
                identifier: issue.identifier,
                priority: issue.priority,
                url: issue.url,
                number: issue.number,
                state: state
                  ? {
                      id: state.id,
                      name: state.name,
                      color: state.color,
                      type: state.type,
                    }
                  : null,
                assignee: assignee
                  ? {
                      id: assignee.id,
                      name: assignee.name,
                      email: assignee.email,
                      displayName: assignee.displayName,
                      avatarUrl: assignee.avatarUrl,
                    }
                  : null,
                team: team
                  ? {
                      id: team.id,
                      name: team.name,
                      key: team.key,
                    }
                  : null,
                project: project
                  ? {
                      id: project.id,
                      name: project.name,
                    }
                  : null,
                createdAt: issue.createdAt,
                updatedAt: issue.updatedAt,
              };
            }),
          );

          // Add pagination info
          const responseWithPagination = {
            issues: formattedIssues,
            pagination: {
              hasNextPage: issues.pageInfo.hasNextPage,
              endCursor: issues.pageInfo.endCursor,
            },
          };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(responseWithPagination, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error searching issues:", error);

          if (error.message && error.message.includes("Rate limit exceeded")) {
            throw new McpError(
              ErrorCode.InternalError,
              `Linear API rate limit exceeded. Try again later or use smaller page sizes.`,
            );
          }

          throw new McpError(
            ErrorCode.InternalError,
            `Failed to search issues: ${error.message}`,
          );
        }
      }

      case "get_issue": {
        // Use Zod schema for validation with the helper function
        const args = validateRequest(getIssueSchema, request.params.arguments);

        // Get issue by ID
        const issue = await linearClient.issue(args.issueId);

        if (!issue) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Issue with ID ${args.issueId} not found`,
          );
        }

        // Fetch related data in parallel for performance
        const [
          state,
          assignee,
          project,
          team,
          creator,
          cycle,
          parent,
          labels,
          subscribers,
          children,
          relations,
          comments,
          attachments,
        ] = await Promise.all([
          issue.state,
          issue.assignee,
          issue.project,
          issue.team,
          issue.creator,
          issue.cycle,
          issue.parent,
          issue.labels(),
          issue.subscribers(),
          issue.children(),
          issue.relations(),
          issue.comments(),
          issue.attachments(),
        ]);

        // Process labels
        const labelsList = labels
          ? labels.nodes.map((label: any) => ({
              id: label.id,
              name: label.name,
              color: label.color,
            }))
          : [];

        const issueDetails: {
          id: string;
          identifier: string;
          title: string;
          description: string | undefined;
          priority: number;
          priorityLabel: string;
          status: string;
          url: string;
          createdAt: Date;
          updatedAt: Date;
          startedAt: Date | null;
          completedAt: Date | null;
          canceledAt: Date | null;
          dueDate: string | null;
          assignee: { id: string; name: string; email: string } | null;
          creator: { id: string; name: string; email: string } | null;
          team: { id: string; name: string; key: string } | null;
          project: { id: string; name: string; state: string } | null;
          parent: { id: string; title: string; identifier: string } | null;
          cycle: { id: string; name: string; number: number } | null;
          labels: Array<{ id: string; name: string; color: string }>;
          comments: Array<{ id: string; body: string; createdAt: Date }>;
          attachments: Array<{ id: string; title: string; url: string }>;
          embeddedImages: Array<{ url: string; analysis: string }>;
          estimate: number | null;
          customerTicketCount: number;
          previousIdentifiers: string[];
          branchName: string;
          archivedAt: Date | null;
          autoArchivedAt: Date | null;
          autoClosedAt: Date | null;
          trashed: boolean;
        } = {
          id: issue.id,
          identifier: issue.identifier,
          title: issue.title,
          description: issue.description,
          priority: issue.priority,
          priorityLabel: issue.priorityLabel,
          status: state ? await state.name : "Unknown",
          url: issue.url,
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
          startedAt: issue.startedAt || null,
          completedAt: issue.completedAt || null,
          canceledAt: issue.canceledAt || null,
          dueDate: issue.dueDate,
          assignee: assignee
            ? {
                id: assignee.id,
                name: assignee.name,
                email: assignee.email,
              }
            : null,
          creator: creator
            ? {
                id: creator.id,
                name: creator.name,
                email: creator.email,
              }
            : null,
          team: team
            ? {
                id: team.id,
                name: team.name,
                key: team.key,
              }
            : null,
          project: project
            ? {
                id: project.id,
                name: project.name,
                state: project.state,
              }
            : null,
          parent: parent
            ? {
                id: parent.id,
                title: parent.title,
                identifier: parent.identifier,
              }
            : null,
          cycle:
            cycle && cycle.name
              ? {
                  id: cycle.id,
                  name: cycle.name,
                  number: cycle.number,
                }
              : null,
          labels: await Promise.all(
            labels.nodes.map(async (label: any) => ({
              id: label.id,
              name: label.name,
              color: label.color,
            })),
          ),
          comments: await Promise.all(
            comments.nodes.map(async (comment: any) => ({
              id: comment.id,
              body: comment.body,
              createdAt: comment.createdAt,
            })),
          ),
          attachments: await Promise.all(
            attachments.nodes.map(async (attachment: any) => ({
              id: attachment.id,
              title: attachment.title,
              url: attachment.url,
            })),
          ),
          embeddedImages: [],
          estimate: issue.estimate || null,
          customerTicketCount: issue.customerTicketCount || 0,
          previousIdentifiers: issue.previousIdentifiers || [],
          branchName: issue.branchName || "",
          archivedAt: issue.archivedAt || null,
          autoArchivedAt: issue.autoArchivedAt || null,
          autoClosedAt: issue.autoClosedAt || null,
          trashed: issue.trashed || false,
        };

        // Extract embedded images from description
        const imageMatches =
          issue.description?.match(/!\[.*?\]\((.*?)\)/g) || [];
        if (imageMatches.length > 0) {
          issueDetails.embeddedImages = imageMatches.map((match) => {
            const url = (match as string).match(/\((.*?)\)/)?.[1] || "";
            return {
              url,
              analysis: "Image analysis would go here", // Replace with actual image analysis if available
            };
          });
        }

        // Add image analysis for attachments if they are images
        issueDetails.attachments = await Promise.all(
          attachments.nodes
            .filter((attachment: any) =>
              attachment.url.match(/\.(jpg|jpeg|png|gif|webp)$/i),
            )
            .map(async (attachment: any) => ({
              id: attachment.id,
              title: attachment.title,
              url: attachment.url,
              analysis: "Image analysis would go here", // Replace with actual image analysis if available
            })),
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(issueDetails, null, 2),
            },
          ],
        };
      }

      case "list_roadmaps": {
        const args = request.params.arguments as unknown as ListRoadmapsArgs;

        try {
          // Use the SDK's roadmaps method
          const roadmapsConnection = await linearClient.roadmaps({
            first: args?.first ?? (args?.last ? undefined : 50),
            last: args?.last,
            after: args?.after,
            before: args?.before,
            includeArchived: args?.includeArchived,
            orderBy: args?.orderBy as any,
          });

          // Process the roadmaps data
          const roadmaps = await Promise.all(
            roadmapsConnection.nodes.map(async (roadmap) => {
              // Fetch creator data if available
              const creator = await roadmap.creator;

              // Base roadmap object without projects
              const roadmapObj = {
                id: roadmap.id,
                name: roadmap.name,
                description: roadmap.description,
                createdAt: roadmap.createdAt,
                updatedAt: roadmap.updatedAt,
                archivedAt: roadmap.archivedAt,
                color: roadmap.color,
                url: roadmap.url,
                creator: creator
                  ? {
                      id: creator.id,
                      name: creator.name,
                    }
                  : null,
              };

              // Only fetch projects if explicitly requested to avoid rate limiting
              if (args?.includeProjects) {
                try {
                  const projectsConnection = await roadmap.projects({
                    first: 50,
                    includeArchived: args?.includeArchived,
                  });

                  return {
                    ...roadmapObj,
                    projectIds: projectsConnection.nodes.map(
                      (project) => project.id,
                    ),
                  };
                } catch (projectError: any) {
                  // If we hit rate limits when fetching projects, return roadmap without projects
                  if (
                    projectError.message &&
                    projectError.message.includes("Rate limit exceeded")
                  ) {
                    console.error(
                      `Rate limit hit while fetching projects for roadmap ${roadmap.id}`,
                    );
                    return {
                      ...roadmapObj,
                      projectIds: [],
                      projectsError: "Projects not loaded due to rate limiting",
                    };
                  }
                  throw projectError;
                }
              }

              // Return roadmap without projects if not requested
              return roadmapObj;
            }),
          );

          // Include pagination information
          const responseData = {
            roadmaps,
            pagination: {
              hasNextPage: roadmapsConnection.pageInfo.hasNextPage,
              hasPreviousPage: roadmapsConnection.pageInfo.hasPreviousPage,
              startCursor: roadmapsConnection.pageInfo.startCursor,
              endCursor: roadmapsConnection.pageInfo.endCursor,
            },
          };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(responseData, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error listing roadmaps:", error);

          // Special handling for rate limit errors
          if (error.message && error.message.includes("Rate limit exceeded")) {
            throw new McpError(
              ErrorCode.InternalError,
              `Linear API rate limit exceeded. Try again later or use smaller page sizes. For more information see: https://developers.linear.app/docs/graphql/working-with-the-graphql-api/rate-limiting`,
            );
          }

          throw new McpError(
            ErrorCode.InternalError,
            `Failed to list roadmaps: ${error.message}`,
          );
        }
      }

      case "get_initiative": {
        const args = validateRequest(
          getInitiativeSchema,
          request.params.arguments,
        );

        try {
          const initiative = await linearClient.initiative(args.initiativeId);

          if (!initiative) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Initiative not found: ${args.initiativeId}`,
            );
          }

          // Fetch creator if available
          const creator = await initiative.creator;

          // Format the initiative response
          const initiativeDetails = {
            id: initiative.id,
            name: initiative.name,
            description: initiative.description,
            creator: creator
              ? {
                  id: creator.id,
                  name: creator.name,
                  email: creator.email,
                  displayName: creator.displayName,
                  avatarUrl: creator.avatarUrl,
                }
              : null,
            createdAt: initiative.createdAt,
            updatedAt: initiative.updatedAt,
            targetDate: initiative.targetDate,
            sortOrder: initiative.sortOrder,
            url: initiative.url,
          };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(initiativeDetails, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error fetching initiative:", error);

          if (error instanceof McpError) {
            throw error;
          }

          throw new McpError(
            ErrorCode.InternalError,
            `Failed to get initiative details: ${error.message}`,
          );
        }
      }

      // Comment tool handlers
      case "create_comment": {
        const args = validateRequest(
          createCommentSchema,
          request.params.arguments,
        );

        try {
          // Verify issue exists
          const issue = await linearClient.issue(args.issueId);
          if (!issue) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Issue not found: ${args.issueId}`,
            );
          }

          // Create comment
          const commentPayload = await linearClient.createComment({
            issueId: args.issueId,
            body: args.body,
          });

          if (!commentPayload) {
            throw new McpError(
              ErrorCode.InternalError,
              "Failed to create comment",
            );
          }

          // The comment is returned in the payload
          const commentFetch = commentPayload.comment;
          if (!commentFetch) {
            throw new McpError(
              ErrorCode.InternalError,
              "Comment was created but no comment data was returned",
            );
          }

          // We need to await all properties
          const comment = await commentFetch;

          // Fetch the user who created the comment
          const userFetch = comment.user;
          const user = userFetch ? await userFetch : null;

          // Format response
          const commentData = {
            id: comment.id,
            body: comment.body,
            user: user
              ? {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  displayName: user.displayName,
                  avatarUrl: user.avatarUrl,
                }
              : null,
            issueId: args.issueId,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
          };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(commentData, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error creating comment:", error);

          if (error instanceof McpError) {
            throw error;
          }

          throw new McpError(
            ErrorCode.InternalError,
            `Failed to create comment: ${error.message}`,
          );
        }
      }

      case "get_comment": {
        const args = request.params.arguments as unknown as GetCommentArgs;

        try {
          const comment = await linearClient.comment({ id: args.commentId });

          if (!comment) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Comment not found: ${args.commentId}`,
            );
          }

          const [user, issue] = await Promise.all([
            comment.user,
            comment.issue,
          ]);

          const commentData = {
            id: comment.id,
            body: comment.body,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            user: user
              ? {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                }
              : null,
            issue: issue
              ? {
                  id: issue.id,
                  title: issue.title,
                  identifier: issue.identifier,
                }
              : null,
          };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(commentData, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to get comment: ${error.message}`,
          );
        }
      }

      case "update_comment": {
        const args = request.params.arguments as unknown as UpdateCommentArgs;

        try {
          const comment = await linearClient.comment({ id: args.commentId });

          if (!comment) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Comment not found: ${args.commentId}`,
            );
          }

          const updatedComment = await comment.update({
            body: args.body,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(updatedComment, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to update comment: ${error.message}`,
          );
        }
      }

      case "delete_comment": {
        const args = request.params.arguments as unknown as DeleteCommentArgs;

        try {
          const comment = await linearClient.comment({ id: args.commentId });

          if (!comment) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Comment not found: ${args.commentId}`,
            );
          }

          const result = await comment.delete();

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ success: result }, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to delete comment: ${error.message}`,
          );
        }
      }

      // Label tool handlers
      case "list_labels": {
        const args = request.params.arguments as unknown as ListLabelsArgs;
        const { teamId, first = 50 } = args;

        try {
          let query;
          if (teamId) {
            const team = await linearClient.team(teamId);
            if (!team) {
              throw new McpError(
                ErrorCode.MethodNotFound,
                `Team not found: ${teamId}`,
              );
            }
            query = await team.labels({ first });
          } else {
            // If no team ID, fetch all labels
            query = await linearClient.issueLabels({ first });
          }

          const labels = (query as any).nodes.map((label: any) => ({
            id: label.id,
            name: label.name,
            color: label.color,
            description: label.description,
            teamId: label.team?.id,
            team: label.team?.name,
          }));

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(labels, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to list labels: ${error.message}`,
          );
        }
      }

      case "create_label": {
        const args = request.params.arguments as unknown as CreateLabelArgs;

        try {
          const team = await linearClient.team(args.teamId);
          if (!team) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Team not found: ${args.teamId}`,
            );
          }

          const label = await linearClient.createIssueLabel({
            name: args.name,
            teamId: args.teamId,
            color: args.color,
            description: args.description,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(label, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to create label: ${error.message}`,
          );
        }
      }

      case "update_label": {
        const args = request.params.arguments as unknown as UpdateLabelArgs;

        try {
          const label = await linearClient.issueLabel(args.labelId);

          if (!label) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Label not found: ${args.labelId}`,
            );
          }

          const updateData: any = {};
          if (args.name) updateData.name = args.name;
          if (args.color) updateData.color = args.color;
          if (args.description) updateData.description = args.description;

          const updatedLabel = await label.update(updateData);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(updatedLabel, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to update label: ${error.message}`,
          );
        }
      }

      // Cycle tool handlers
      case "list_cycles": {
        const args = request.params.arguments as unknown as ListCyclesArgs;
        const { teamId, first = 50 } = args;

        try {
          let cycles = [];

          if (teamId) {
            const team = await linearClient.team(teamId);
            if (!team) {
              throw new McpError(
                ErrorCode.MethodNotFound,
                `Team not found: ${teamId}`,
              );
            }
            const query = await team.cycles({ first });
            cycles = (query as any).nodes;
          } else {
            // If no team ID, fetch all cycles
            const query = await linearClient.cycles({ first });
            cycles = (query as any).nodes;
          }

          const formattedCycles = cycles.map((cycle: any) => ({
            id: cycle.id,
            name: cycle.name,
            description: cycle.description,
            number: cycle.number,
            startDate: cycle.startDate,
            endDate: cycle.endDate,
            completedAt: cycle.completedAt,
            team: cycle.team
              ? {
                  id: cycle.team.id,
                  name: cycle.team.name,
                  key: cycle.team.key,
                }
              : null,
          }));

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(formattedCycles, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to list cycles: ${error.message}`,
          );
        }
      }

      case "create_cycle": {
        const args = request.params.arguments as unknown as CreateCycleArgs;

        try {
          const team = await linearClient.team(args.teamId);
          if (!team) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Team not found: ${args.teamId}`,
            );
          }

          const cycle = await linearClient.createCycle({
            teamId: args.teamId,
            name: args.name,
            description: args.description,
            startsAt: new Date(args.startDate),
            endsAt: new Date(args.endDate),
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(cycle, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to create cycle: ${error.message}`,
          );
        }
      }

      case "update_cycle": {
        const args = request.params.arguments as unknown as UpdateCycleArgs;

        try {
          const cycle = await linearClient.cycle(args.cycleId);

          if (!cycle) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Cycle not found: ${args.cycleId}`,
            );
          }

          const updateData: any = {};
          if (args.name) updateData.name = args.name;
          if (args.description) updateData.description = args.description;
          if (args.startDate) updateData.startsAt = new Date(args.startDate);
          if (args.endDate) updateData.endsAt = new Date(args.endDate);

          const updatedCycle = await cycle.update(updateData);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(updatedCycle, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to update cycle: ${error.message}`,
          );
        }
      }

      // Document tool handlers
      case "list_documents": {
        const args = request.params.arguments as unknown as ListDocumentsArgs;
        const { teamId, first = 50 } = args;

        try {
          // Get all documents
          const documentsConnection = await linearClient.documents({
            first,
          });

          let documents = [];

          if (teamId) {
            // Verify team exists
            const team = await linearClient.team(teamId);
            if (!team) {
              throw new McpError(
                ErrorCode.MethodNotFound,
                `Team not found: ${teamId}`,
              );
            }

            // Get all documents from this team using the document creation method
            const teamDocumentsQuery = await linearClient.client.rawRequest(
              `
              query TeamDocuments($teamId: String!, $first: Int!) {
                team(id: $teamId) {
                  documents(first: $first) {
                    nodes {
                      id
                    }
                  }
                }
              }
              `,
              { teamId, first },
            );

            // Extract document IDs that belong to this team
            const teamData = teamDocumentsQuery.data as any;
            const teamDocIds =
              teamData?.team?.documents?.nodes?.map((doc: any) => doc.id) || [];
            const teamDocIdSet = new Set(teamDocIds);

            // Filter documents by those belonging to the team
            const teamDocuments = documentsConnection.nodes.filter((doc) =>
              teamDocIdSet.has(doc.id),
            );

            documents = await Promise.all(
              teamDocuments.map(async (doc) => {
                // Get creator and project details
                const [creator, project] = await Promise.all([
                  doc.creator,
                  doc.project,
                ]);

                // Construct document object with available properties
                return {
                  id: doc.id,
                  title: doc.title,
                  url: doc.url,
                  createdAt: doc.createdAt,
                  updatedAt: doc.updatedAt,
                  teamId: teamId,
                  teamName: team.name,
                  creator: creator
                    ? {
                        id: creator.id,
                        name: creator.name,
                      }
                    : null,
                  project: project
                    ? {
                        id: project.id,
                        name: project.name,
                      }
                    : null,
                };
              }),
            );
          } else {
            // For all documents, get as much info as we can
            // Note: We won't be able to get team info directly from documents
            // So we'll just return documents without team info
            documents = await Promise.all(
              documentsConnection.nodes.map(async (doc) => {
                // Get creator and project details
                const [creator, project] = await Promise.all([
                  doc.creator,
                  doc.project,
                ]);

                // Construct document object with available properties
                return {
                  id: doc.id,
                  title: doc.title,
                  url: doc.url,
                  createdAt: doc.createdAt,
                  updatedAt: doc.updatedAt,
                  creator: creator
                    ? {
                        id: creator.id,
                        name: creator.name,
                      }
                    : null,
                  project: project
                    ? {
                        id: project.id,
                        name: project.name,
                      }
                    : null,
                };
              }),
            );
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(documents, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to list documents: ${error.message}`,
          );
        }
      }

      case "create_document": {
        const args = request.params.arguments as unknown as CreateDocumentArgs;

        try {
          // Check if team exists
          const team = await linearClient.team(args.teamId);
          if (!team) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Team not found: ${args.teamId}`,
            );
          }

          // Check if project exists if provided
          if (args.projectId) {
            const project = await linearClient.project(args.projectId);
            if (!project) {
              throw new McpError(
                ErrorCode.MethodNotFound,
                `Project not found: ${args.projectId}`,
              );
            }
          }

          const documentData: any = {
            title: args.title,
            content: args.content,
            teamId: args.teamId,
          };

          if (args.projectId) {
            documentData.projectId = args.projectId;
          }

          const document = await linearClient.createDocument(documentData);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(document, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to create document: ${error.message}`,
          );
        }
      }

      case "update_document": {
        const args = request.params.arguments as unknown as UpdateDocumentArgs;

        try {
          const document = await linearClient.document(args.documentId);

          if (!document) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Document not found: ${args.documentId}`,
            );
          }

          const updateData: any = {};
          if (args.title) updateData.title = args.title;
          if (args.content) updateData.content = args.content;

          const updatedDocument = await document.update(updateData);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(updatedDocument, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to update document: ${error.message}`,
          );
        }
      }

      // User tool handlers
      case "list_users": {
        const args = request.params.arguments as unknown as ListUsersArgs;
        const { first = 50 } = args;

        try {
          const query = await linearClient.users({ first });

          const users = (query as any).nodes.map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            active: user.active,
            admin: user.admin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          }));

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(users, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to list users: ${error.message}`,
          );
        }
      }

      case "get_user": {
        const args = request.params.arguments as unknown as GetUserArgs;

        try {
          const user = await linearClient.user(args.userId);

          if (!user) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `User not found: ${args.userId}`,
            );
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(user, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to get user: ${error.message}`,
          );
        }
      }

      case "me": {
        try {
          const user = await linearClient.viewer;
          
          // Fetch teams directly using the built-in teams() method
          const teamsConnection = await user.teams();
          const teams = teamsConnection.nodes.map(team => ({
            id: team.id,
            name: team.name,
            key: team.key
          }));
          
          // Add teams to user data
          const userData = {
            ...user,
            teams
          };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(userData, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to get authenticated user: ${error.message}`,
          );
        }
      }

      case "get_team": {
        const args = request.params.arguments as unknown as GetTeamArgs;

        try {
          const team = await linearClient.team(args.teamId);

          if (!team) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Team not found: ${args.teamId}`,
            );
          }

          // Get organization info
          const organization = await team.organization;

          // Get team members - use teamMembers query correctly
          const membersQuery = await linearClient.teamMemberships();
          // Filter members after getting their team relationship with await
          const teamMembers = [];
          for (const member of membersQuery.nodes) {
            const memberTeam = await member.team;
            if (memberTeam && memberTeam.id === team.id) {
              teamMembers.push(member);
            }
          }

          const members = await Promise.all(
            teamMembers.map(async (member) => {
              const user = await member.user;
              return {
                id: member.id,
                user: user
                  ? {
                      id: user.id,
                      name: user.name,
                      email: user.email,
                      displayName: user.displayName,
                      avatarUrl: user.avatarUrl,
                      active: user.active,
                    }
                  : null,
                // Replace role with a safer property that exists
                owner: member.owner,
                createdAt: member.createdAt,
                updatedAt: member.updatedAt,
              };
            }),
          );

          // Get team states
          const statesConnection = await team.states();
          const states = statesConnection.nodes.map((state) => ({
            id: state.id,
            name: state.name,
            color: state.color,
            type: state.type,
            description: state.description,
            position: state.position,
          }));

          // Fix template type to handle undefined description
          let templates: Array<{
            id: string;
            name: string;
            description: string | null;
            type: string;
          }> = [];
          try {
            const templatesConnection = await team.templates();
            templates = templatesConnection.nodes.map((template) => ({
              id: template.id,
              name: template.name,
              description: template.description || null, // Handle undefined
              type: template.type,
            }));
          } catch (error) {
            // Templates might not be available for all teams
            console.error(
              `Error fetching templates for team ${args.teamId}:`,
              error,
            );
          }

          // Build comprehensive team object
          const teamDetail = {
            id: team.id,
            name: team.name,
            key: team.key,
            description: team.description,
            color: team.color,
            private: team.private,

            // Stats and metrics
            issueCount: team.issueCount,
            issueEstimationMethod: team.issueEstimationType,
            cycleIssueAutoAssignCompleted: team.cycleIssueAutoAssignCompleted,
            cycleIssueAutoAssignStarted: team.cycleIssueAutoAssignStarted,
            cycleCooldownTime: team.cycleCooldownTime,
            cycleDuration: team.cycleDuration,
            upcomingCycleCount: team.upcomingCycleCount,
            timezone: team.timezone,

            // Settings
            autoClosePeriod: team.autoClosePeriod,
            autoCloseStateId: team.autoCloseStateId,
            defaultIssueEstimate: team.defaultIssueEstimate,
            defaultTemplateForMembersId: team.defaultTemplateForMembersId,
            defaultTemplateForNonMembersId: team.defaultTemplateForNonMembersId,
            draftWorkflowState: team.draftWorkflowState
              ? { id: (await team.draftWorkflowState)?.id }
              : null,
            startWorkflowState: team.startWorkflowState
              ? { id: (await team.startWorkflowState)?.id }
              : null,

            // Integrations
            integrations: {
              slackIssueComments: team.slackIssueComments,
              slackIssueStatuses: team.slackIssueStatuses,
              slackNewIssue: team.slackNewIssue,
            },

            // Dates
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,

            // Related entities
            organization: organization
              ? {
                  id: organization.id,
                  name: organization.name,
                  logoUrl: organization.logoUrl,
                  urlKey: organization.urlKey,
                }
              : null,

            // Collections
            members,
            states,
            templates,
          };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(teamDetail, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error fetching team:", error);
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to get team: ${error.message}`,
          );
        }
      }

      case "get_project": {
        const args = request.params.arguments as unknown as GetProjectArgs;

        try {
          const project = await linearClient.project(args.projectId);

          if (!project) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Project not found: ${args.projectId}`,
            );
          }

          // Get relationships, milestones, and updates
          const [
            creator,
            lead,
            teamsConnection,
            issuesConnection,
            milestonesConnection,
            updatesConnection,
          ] = await Promise.all([
            project.creator,
            project.lead,
            project.teams(),
            project.issues({ first: 100 }),
            project.projectMilestones({ first: 50 }), // Fetch milestones using SDK method
            project.projectUpdates({ first: 10 }), // Fetch latest 10 project updates
          ]);

          // Process teams
          const teams = teamsConnection.nodes.map((team) => ({
            id: team.id,
            name: team.name,
            key: team.key,
          }));

          // Process members - use a more efficient approach to get actual project members
          // instead of assuming all users are members of the project
          let members = [];
          try {
            // Query project members directly using the project members API
            const membersQuery = await linearClient.client.rawRequest(
              `
              query ProjectMembers($projectId: String!) {
                project(id: $projectId) {
                  members {
                    nodes {
                      id
                      user {
                        id
                        name
                        email
                      }
                    }
                  }
                }
              }
              `,
              { projectId: args.projectId },
            );

            // Process the response safely
            const projectData = membersQuery.data as any;
            if (projectData?.project?.members?.nodes) {
              members = projectData.project.members.nodes;
            } else {
              // Fallback to project lead and creator as members if specific members not available
              members = [];
              if (creator) {
                members.push({
                  id: creator.id,
                  user: {
                    id: creator.id,
                    name: creator.name,
                    email: creator.email,
                  },
                });
              }
              if (lead && lead.id !== creator?.id) {
                members.push({
                  id: lead.id,
                  user: {
                    id: lead.id,
                    name: lead.name,
                    email: lead.email,
                  },
                });
              }
            }
          } catch (error) {
            console.error(
              `Error fetching members for project ${args.projectId}:`,
              error,
            );
            // Create minimal member list from creator and lead
            members = [];
            if (creator) {
              members.push({
                id: creator.id,
                user: {
                  id: creator.id,
                  name: creator.name,
                  email: creator.email,
                },
              });
            }
            if (lead && lead.id !== creator?.id) {
              members.push({
                id: lead.id,
                user: {
                  id: lead.id,
                  name: lead.name,
                  email: lead.email,
                },
              });
            }
          }

          // Get issue stats - use nodes length and filtering
          const issueCount = issuesConnection.nodes.length;
          const issueStats = {
            total: issueCount,
            completed: issuesConnection.nodes.filter(
              (issue) => issue.completedAt,
            ).length,
            open: issuesConnection.nodes.filter(
              (issue) => !issue.completedAt && !issue.canceledAt,
            ).length,
            canceled: issuesConnection.nodes.filter((issue) => issue.canceledAt)
              .length,
          };

          // Process project milestones from SDK call
          const milestones = await Promise.all(
            milestonesConnection.nodes.map(async (milestone) => {
              // Assuming ProjectMilestone has these fields based on common patterns and previous query
              // You might need to adjust based on the actual ProjectMilestone definition if different
              return {
                id: milestone.id,
                name: milestone.name,
                description: milestone.description || null,
                targetDate: milestone.targetDate || null,
                // Additional fields like completedAt might require fetching the full milestone if needed
                // sortOrder: milestone.sortOrder,
                // createdAt: milestone.createdAt,
                // updatedAt: milestone.updatedAt,
              };
            }),
          );

          // Process project updates
          const updates = await Promise.all(
            updatesConnection.nodes.map(async (update) => {
              const user = await update.user; // Fetch the user who created the update
              return {
                id: update.id,
                createdAt: update.createdAt,
                updatedAt: update.updatedAt,
                body: update.body,
                health: update.health,
                user: user ? { id: user.id, name: user.name } : null,
                url: update.url,
              };
            }),
          );

          // Build comprehensive project object
          const projectDetail = {
            id: project.id,
            name: project.name,
            description: project.description,
            slugId: project.slugId,
            url: project.url,
            color: project.color,
            icon: project.icon,

            // Dates
            startDate: project.startDate,
            targetDate: project.targetDate,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            completedAt: project.completedAt,
            canceledAt: project.canceledAt,

            // Status and progress
            state: project.state,
            progress: project.progress,
            sortOrder: project.sortOrder,

            // Settings
            autoArchivedAt: project.autoArchivedAt,
            issueCountHistory: project.issueCountHistory,
            completedIssueCountHistory: project.completedIssueCountHistory,
            scopeHistory: project.scopeHistory,
            completedScopeHistory: project.completedScopeHistory,
            trashed: project.trashed,

            // Relationships
            creator: creator
              ? {
                  id: creator.id,
                  name: creator.name,
                  email: creator.email,
                }
              : null,

            lead: lead
              ? {
                  id: lead.id,
                  name: lead.name,
                  email: lead.email,
                }
              : null,

            // Collections
            teams,
            members,
            issueStats,
            milestones,
            updates,
          };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(projectDetail, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error fetching project:", error);
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to get project: ${error.message}`,
          );
        }
      }

      case "get_roadmap": {
        const args = request.params.arguments as unknown as GetRoadmapArgs;

        try {
          const roadmap = await linearClient.roadmap(args.roadmapId);

          if (!roadmap) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Roadmap not found: ${args.roadmapId}`,
            );
          }

          // Get creator
          const creator = await roadmap.creator;

          // Define a more specific interface for roadmap details
          interface RoadmapDetail {
            id: string;
            name: string;
            description?: string | null;
            color?: string | null;
            createdAt: Date;
            updatedAt: Date;
            archivedAt?: Date | null;
            url?: string;
            creator?: {
              id: string;
              name?: string;
            } | null;
            projects?:
              | Array<{
                  id: string;
                  name: string;
                  description?: string | null;
                  state?: string;
                  startDate?: string | null;
                  targetDate?: string | null;
                  progress?: number;
                  lead?: {
                    id: string;
                    name?: string;
                  } | null;
                  teams?: Array<{
                    id: string;
                    name?: string;
                    key?: string;
                  }>;
                }>
              | { error: string };
          }

          // Build base roadmap details
          const roadmapDetail: RoadmapDetail = {
            id: roadmap.id,
            name: roadmap.name,
            description: roadmap.description,
            color: roadmap.color,
            createdAt: roadmap.createdAt,
            updatedAt: roadmap.updatedAt,
            archivedAt: roadmap.archivedAt,
            url: roadmap.url,

            creator: creator
              ? {
                  id: creator.id,
                  name: creator.name,
                }
              : null,
          };

          // Include projects if requested
          const includeProjects = args.includeProjects !== false; // Default to true if not specified

          if (includeProjects) {
            try {
              const projectsConnection = await roadmap.projects({
                first: 100,
                includeArchived: args.includeProjects && args.includeArchived,
              });

              // Get detailed project info
              const projects = await Promise.all(
                projectsConnection.nodes.map(async (project) => {
                  try {
                    // Get relationships
                    const [lead, teams] = await Promise.all([
                      project.lead,
                      project.teams(),
                    ]);

                    return {
                      id: project.id,
                      name: project.name,
                      description: project.description,
                      state: project.state,
                      startDate: project.startDate,
                      targetDate: project.targetDate,
                      progress: project.progress,

                      lead: lead
                        ? {
                            id: lead.id,
                            name: lead.name,
                          }
                        : null,

                      teams: teams.nodes.map((team) => ({
                        id: team.id,
                        name: team.name,
                        key: team.key,
                      })),
                    };
                  } catch (projectError) {
                    console.error(
                      `Error processing project ${project.id}:`,
                      projectError,
                    );
                    // Return basic project info if detailed info fails
                    return {
                      id: project.id,
                      name: project.name,
                      description: project.description,
                      state: project.state,
                      teams: [],
                    };
                  }
                }),
              );

              roadmapDetail.projects = projects;
            } catch (error: any) {
              // Handle rate limiting or other errors for projects
              const errorMessage = error?.message || "Unknown error";

              if (errorMessage.includes("Rate limit exceeded")) {
                console.error(
                  `Rate limit hit when fetching projects for roadmap ${args.roadmapId}`,
                );
                roadmapDetail.projects = {
                  error:
                    "Projects not loaded due to rate limiting. Try again later.",
                };
              } else {
                console.error(
                  `Error loading projects for roadmap ${args.roadmapId}:`,
                  error,
                );
                roadmapDetail.projects = {
                  error: `Error loading projects: ${errorMessage}`,
                };
              }
            }
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(roadmapDetail, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error fetching roadmap:", error);
          const errorMessage = error?.message || "Unknown error";

          // Provide more specific error information based on error type
          if (errorMessage.includes("Rate limit exceeded")) {
            throw new McpError(
              ErrorCode.InternalError,
              `Linear API rate limit exceeded. Try again later or use smaller page sizes. For more information see: https://developers.linear.app/docs/graphql/working-with-the-graphql-api/rate-limiting`,
            );
          } else if (
            errorMessage.includes("not found") ||
            errorMessage.includes("does not exist")
          ) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Roadmap not found: ${args.roadmapId}`,
            );
          } else {
            throw new McpError(
              ErrorCode.InternalError,
              `Failed to get roadmap: ${errorMessage}`,
            );
          }
        }
      }

      case "get_label": {
        const args = request.params.arguments as unknown as GetLabelArgs;

        try {
          const label = await linearClient.issueLabel(args.labelId);

          if (!label) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Label not found: ${args.labelId}`,
            );
          }

          // Get related entities
          const [team, creator, parent] = await Promise.all([
            label.team,
            label.creator,
            label.parent,
          ]);

          // Get usage statistics - use issues query with a count
          const issuesConnection = await linearClient.issues({
            filter: {
              labels: {
                some: {
                  id: {
                    eq: args.labelId,
                  },
                },
              },
            },
          });

          // Build comprehensive label object
          const labelDetail = {
            id: label.id,
            name: label.name,
            description: label.description,
            color: label.color,

            // Usage stats - use the array length
            issueCount: issuesConnection.nodes.length,

            // Relationships
            team: team
              ? {
                  id: team.id,
                  name: team.name,
                  key: team.key,
                }
              : null,

            creator: creator
              ? {
                  id: creator.id,
                  name: creator.name,
                  email: creator.email,
                }
              : null,

            parent: parent
              ? {
                  id: parent.id,
                  name: parent.name,
                  color: parent.color,
                }
              : null,

            // Metadata
            createdAt: label.createdAt,
            updatedAt: label.updatedAt,
            archivedAt: label.archivedAt,
          };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(labelDetail, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error fetching label:", error);
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to get label: ${error.message}`,
          );
        }
      }

      case "get_cycle": {
        const args = request.params.arguments as unknown as GetCycleArgs;

        try {
          const cycle = await linearClient.cycle(args.cycleId);

          if (!cycle) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Cycle not found: ${args.cycleId}`,
            );
          }

          // Get related entities
          const team = await cycle.team;

          // Get cycle statistics - create a brand new object
          // and don't use the complex cycle.uncompletedIssuesUponClose property at all
          const cycleStats = {
            issueCountHistory: (cycle.issueCountHistory || []) as any[],
            completedIssueCountHistory: (cycle.completedIssueCountHistory ||
              []) as any[],
            scopeHistory: (cycle.scopeHistory || []) as any[],
            completedScopeHistory: (cycle.completedScopeHistory || []) as any[],
            inProgressScopeHistory: (cycle.inProgressScopeHistory ||
              []) as any[],
            uncompletedIssuesUponClose: 0, // Just use a default value of 0
          };

          // Define a more specific interface for cycle details
          interface CycleDetail {
            id: string;
            name: string | null;
            description?: string | null;
            number: number;
            startsAt?: Date | null;
            endsAt?: Date | null;
            completedAt?: Date | null;
            createdAt: Date;
            updatedAt: Date;
            progress?: number;
            team?: {
              id: string;
              name?: string;
              key?: string;
            } | null;
            stats: {
              issueCountHistory: any[];
              completedIssueCountHistory: any[];
              scopeHistory: any[];
              completedScopeHistory: any[];
              inProgressScopeHistory: any[];
              uncompletedIssuesUponClose: number;
            };
            issues?:
              | Array<{
                  id: string;
                  title: string;
                  identifier: string;
                  status?: string;
                  priority?: number;
                  createdAt: Date;
                  updatedAt: Date;
                  completedAt?: Date | null;
                  canceledAt?: Date | null;
                  dueDate?: string | null;
                }>
              | { error: string };
          }

          // Build cycle object with proper type
          const cycleDetail: CycleDetail = {
            id: cycle.id,
            name: cycle.name || null,
            description: cycle.description,
            number: cycle.number,

            // Dates
            startsAt: cycle.startsAt,
            endsAt: cycle.endsAt,
            completedAt: cycle.completedAt,
            createdAt: cycle.createdAt,
            updatedAt: cycle.updatedAt,

            // Status
            progress: cycle.progress,

            // Team relationship
            team: team
              ? {
                  id: team.id,
                  name: team.name,
                  key: team.key,
                }
              : null,

            // Statistics - use the prepared stats object
            stats: cycleStats,
          };

          // Include issues if requested
          if (args.includeIssues) {
            try {
              // Use a configurable page size with a reasonable default
              const pageSize = Math.min(100, Math.max(1, args.first || 50));

              // Query issues using a more efficient approach that includes needed relationships
              // This reduces the number of follow-up API calls needed
              const issuesQuery = await linearClient.client.rawRequest(
                `
                query CycleIssues($cycleId: String!, $first: Int!) {
                  cycle(id: $cycleId) {
                    issues(first: $first) {
                      nodes {
                        id
                        title
                        identifier
                        priority
                        createdAt
                        updatedAt
                        completedAt
                        canceledAt
                        dueDate
                        state {
                          id
                          name
                        }
                      }
                    }
                  }
                }
                `,
                { cycleId: args.cycleId, first: pageSize },
              );

              // Process the response safely
              const cycleData = issuesQuery.data as any;
              if (cycleData?.cycle?.issues?.nodes) {
                const issuesData = cycleData.cycle.issues.nodes;

                cycleDetail.issues = issuesData.map((issue: any) => ({
                  id: issue.id,
                  title: issue.title,
                  identifier: issue.identifier,
                  status: issue.state ? issue.state.name : undefined,
                  priority: issue.priority,
                  createdAt: new Date(issue.createdAt),
                  updatedAt: new Date(issue.updatedAt),
                  completedAt: issue.completedAt
                    ? new Date(issue.completedAt)
                    : null,
                  canceledAt: issue.canceledAt
                    ? new Date(issue.canceledAt)
                    : null,
                  dueDate: issue.dueDate,
                }));
              } else {
                cycleDetail.issues = [];
              }
            } catch (error: any) {
              const errorMessage = error?.message || "Unknown error";

              if (errorMessage.includes("Rate limit exceeded")) {
                console.error(
                  `Rate limit hit when fetching issues for cycle ${args.cycleId}`,
                );
                cycleDetail.issues = {
                  error:
                    "Issues not loaded due to rate limiting. Try again later.",
                };
              } else {
                console.error(
                  `Error loading issues for cycle ${args.cycleId}:`,
                  error,
                );
                cycleDetail.issues = {
                  error: `Error loading issues: ${errorMessage}`,
                };
              }
            }
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(cycleDetail, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error fetching cycle:", error);
          const errorMessage = error?.message || "Unknown error";

          // Provide more specific error information based on error type
          if (errorMessage.includes("Rate limit exceeded")) {
            throw new McpError(
              ErrorCode.InternalError,
              `Linear API rate limit exceeded. Try again later or use smaller page sizes.`,
            );
          } else if (
            errorMessage.includes("not found") ||
            errorMessage.includes("does not exist")
          ) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Cycle not found: ${args.cycleId}`,
            );
          } else {
            throw new McpError(
              ErrorCode.InternalError,
              `Failed to get cycle: ${errorMessage}`,
            );
          }
        }
      }

      case "get_document": {
        const args = request.params.arguments as unknown as GetDocumentArgs;

        try {
          const document = await linearClient.document(args.documentId);

          if (!document) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Document not found: ${args.documentId}`,
            );
          }

          // Get related entities
          const [creator, project] = await Promise.all([
            document.creator,
            document.project,
          ]);

          // Get team (requires a workaround since there's no direct way to get it)
          let team = null;
          if (project) {
            const teamsConnection = await project.teams();
            if (teamsConnection.nodes.length > 0) {
              const firstTeam = teamsConnection.nodes[0];
              team = {
                id: firstTeam.id,
                name: firstTeam.name,
                key: firstTeam.key,
              };
            }
          }

          // Build comprehensive document object
          const documentDetail = {
            id: document.id,
            title: document.title,
            content: document.content, // Return the markdown content
            icon: document.icon,
            color: document.color,
            url: document.url,

            // Metadata
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            archivedAt: document.archivedAt,
            trashed: document.trashed,

            // Relationships
            creator: creator
              ? {
                  id: creator.id,
                  name: creator.name,
                  email: creator.email,
                }
              : null,

            project: project
              ? {
                  id: project.id,
                  name: project.name,
                  state: project.state,
                }
              : null,

            team,
          };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(documentDetail, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error fetching document:", error);
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to get document: ${error.message}`,
          );
        }
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`,
        );
    }
  } catch (error: any) {
    console.error("Linear API Error:", error);
    return {
      content: [
        {
          type: "text",
          text: `Linear API error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Linear MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
