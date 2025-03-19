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
    version: "37.0.0", // Match Linear SDK version
  },
  {
    capabilities: {
      tools: {
        create_issue: true,
        list_issues: true,
        update_issue: true,
        list_teams: true,
        list_projects: true,
        search_issues: true,
        get_issue: true,
        list_roadmaps: true,
        get_initiative: true,
        // Comments
        create_comment: true,
        get_comment: true,
        update_comment: true, 
        delete_comment: true,
        // Labels
        list_labels: true,
        create_label: true,
        update_label: true,
        // Cycles
        list_cycles: true,
        create_cycle: true,
        update_cycle: true,
        // Documents
        list_documents: true,
        create_document: true,
        update_document: true,
        // Users
        list_users: true,
        get_user: true,
        me: true,
      },
    },
  }
);

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
            description: "Filter by due date greater than or equal (ISO format, optional)",
          },
          dueDateLte: {
            type: "string",
            description: "Filter by due date less than or equal (ISO format, optional)",
          },
          createdAtGte: {
            type: "string",
            description: "Filter by created date greater than or equal (ISO format, optional)",
          },
          createdAtLte: {
            type: "string",
            description: "Filter by created date less than or equal (ISO format, optional)",
          },
          updatedAtGte: {
            type: "string",
            description: "Filter by updated date greater than or equal (ISO format, optional)",
          },
          updatedAtLte: {
            type: "string",
            description: "Filter by updated date less than or equal (ISO format, optional)",
          },
          completedAtGte: {
            type: "string",
            description: "Filter by completed date greater than or equal (ISO format, optional)",
          },
          completedAtLte: {
            type: "string",
            description: "Filter by completed date less than or equal (ISO format, optional)",
          },
          canceledAtGte: {
            type: "string",
            description: "Filter by canceled date greater than or equal (ISO format, optional)",
          },
          canceledAtLte: {
            type: "string",
            description: "Filter by canceled date less than or equal (ISO format, optional)",
          },
          startedAtGte: {
            type: "string",
            description: "Filter by started date greater than or equal (ISO format, optional)",
          },
          startedAtLte: {
            type: "string",
            description: "Filter by started date less than or equal (ISO format, optional)",
          },
          archivedAtGte: {
            type: "string",
            description: "Filter by archived date greater than or equal (ISO format, optional)",
          },
          archivedAtLte: {
            type: "string",
            description: "Filter by archived date less than or equal (ISO format, optional)",
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
              type: "string"
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
            description: "Filter issues that are blocking other issues (optional)",
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
              type: "string"
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
      name: "list_teams",
      description: "List all teams in the workspace",
      inputSchema: {
        type: "object",
        properties: {},
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
            description: "Cursor for pagination - get projects after this cursor",
          },
          orderBy: {
            type: "string",
            enum: ["createdAt", "updatedAt"],
            description: "Sort projects by field (createdAt, updatedAt)",
          },
          teamId: {
            type: "string",
            description: "Filter by team ID - shows projects accessible to the specified team",
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
            description: "Filter by project state (backlog, planned, started, paused, completed, canceled)",
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
            description: "Filter projects created before this date (ISO format)",
          },
          updatedAfter: {
            type: "string",
            description: "Filter projects updated after this date (ISO format)",
          },
          updatedBefore: {
            type: "string",
            description: "Filter projects updated before this date (ISO format)",
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
            description: "Filter projects completed after this date (ISO format)",
          },
          completedBefore: {
            type: "string",
            description: "Filter projects completed before this date (ISO format)",
          },
          canceledAfter: {
            type: "string",
            description: "Filter projects canceled after this date (ISO format)",
          },
          canceledBefore: {
            type: "string",
            description: "Filter projects canceled before this date (ISO format)",
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
      name: "list_roadmaps",
      description: "List all roadmaps (previously called initiatives)",
      inputSchema: {
        type: "object",
        properties: {
          first: {
            type: "number",
            description: "Number of roadmaps to return from the beginning (default: 50)",
          },
          last: {
            type: "number",
            description: "Number of roadmaps to return from the end (alternative to first)",
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
    // Comment tools
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
    // Label tools
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
    // Cycle tools
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
    // Document tools
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
            description: "Project ID the document is associated with (optional)",
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

type CreateIssueArgs = {
  title: string;
  description?: string;
  teamId: string;
  assigneeId?: string;
  priority?: number;
  labels?: string[];
};

type ListIssuesArgs = {
  teamId?: string;
  assigneeId?: string;
  status?: string;
  first?: number;
  projectId?: string;
  creatorId?: string;
  priority?: number;
  dueDate?: string;
  dueDateGte?: string;
  dueDateLte?: string;
  createdAtGte?: string;
  createdAtLte?: string;
  updatedAtGte?: string;
  updatedAtLte?: string;
  completedAtGte?: string;
  completedAtLte?: string;
  canceledAtGte?: string;
  canceledAtLte?: string;
  startedAtGte?: string;
  startedAtLte?: string;
  archivedAtGte?: string;
  archivedAtLte?: string;
  title?: string;
  titleContains?: string;
  description?: string;
  descriptionContains?: string;
  number?: number;
  labelIds?: string[];
  cycleId?: string;
  parentId?: string;
  estimate?: number;
  estimateGte?: number;
  estimateLte?: number;
  isBlocked?: boolean;
  isBlocking?: boolean;
  isDuplicate?: boolean;
  hasRelations?: boolean;
  subscriberIds?: string[];
  includeArchived?: boolean;
  orderBy?: "createdAt" | "updatedAt" | "priority";
};

type UpdateIssueArgs = {
  issueId: string;
  title?: string;
  description?: string;
  status?: string;
  assigneeId?: string;
  priority?: number;
  labels?: string[];
};

// Update with all the fields defined in the input schema:
type ListProjectsArgs = {
  first?: number;
  after?: string;
  orderBy?: "createdAt" | "updatedAt";
  teamId?: string;
  id?: string;
  name?: string;
  state?: string;
  health?: "onTrack" | "atRisk" | "offTrack";
  priority?: number;
  creatorId?: string;
  leadId?: string;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  startDate?: string;
  targetDate?: string;
  completedAfter?: string;
  completedBefore?: string;
  canceledAfter?: string;
  canceledBefore?: string;
  hasBlocking?: boolean;
  hasBlocked?: boolean;
};

type SearchIssuesArgs = {
  query: string;
  first?: number;
};

type GetIssueArgs = {
  issueId: string;
};

type ListRoadmapsArgs = {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
  includeArchived?: boolean;
  orderBy?: 'createdAt' | 'updatedAt';
  includeProjects?: boolean;
};

type GetInitiativeArgs = {
  initiativeId: string;
};

// Comment types
type CreateCommentArgs = {
  issueId: string;
  body: string;
};

type GetCommentArgs = {
  commentId: string;
};

type UpdateCommentArgs = {
  commentId: string;
  body: string;
};

type DeleteCommentArgs = {
  commentId: string;
};

// Label types
type ListLabelsArgs = {
  teamId?: string;
  first?: number;
};

type CreateLabelArgs = {
  teamId: string;
  name: string;
  color?: string;
  description?: string;
};

type UpdateLabelArgs = {
  labelId: string;
  name?: string;
  color?: string;
  description?: string;
};

// Cycle types
type ListCyclesArgs = {
  teamId?: string;
  first?: number;
};

type CreateCycleArgs = {
  teamId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
};

type UpdateCycleArgs = {
  cycleId: string;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
};

// Document types
type ListDocumentsArgs = {
  teamId?: string;
  first?: number;
};

type CreateDocumentArgs = {
  title: string;
  content: string;
  teamId: string;
  projectId?: string;
};

type UpdateDocumentArgs = {
  documentId: string;
  title?: string;
  content?: string;
};

// User types
type ListUsersArgs = {
  first?: number;
};

type GetUserArgs = {
  userId: string;
};

type MeArgs = {};

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    console.error(`Tool called: ${request.params.name}`);
    console.error(`Full request:`, JSON.stringify(request));
    
    switch (request.params.name) {
      case "create_issue": {
        const args = request.params.arguments as unknown as CreateIssueArgs;
        if (!args?.title || !args?.teamId) {
          throw new Error("Title and teamId are required");
        }

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
        const args = request.params.arguments as unknown as ListIssuesArgs;
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
        if (args?.priority !== undefined) filter.priority = { eq: args.priority };
        
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
          if (args.descriptionContains) filter.description.contains = args.descriptionContains;
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
        if (args?.estimate !== undefined || args?.estimateGte !== undefined || args?.estimateLte !== undefined) {
          filter.estimate = {};
          if (args.estimate !== undefined) filter.estimate.eq = args.estimate;
          if (args.estimateGte !== undefined) filter.estimate.gte = args.estimateGte;
          if (args.estimateLte !== undefined) filter.estimate.lte = args.estimateLte;
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
          includeArchived: args?.includeArchived || false
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
              labels
            ] = await Promise.all([
              issue.state,
              issue.assignee,
              issue.project,
              issue.team,
              issue.creator,
              issue.cycle,
              issue.parent,
              issue.labels()
            ]);
            
            // Process labels
            const labelsList = labels ? 
              labels.nodes.map((label: any) => ({
                id: label.id,
                name: label.name,
                color: label.color
              })) : [];
              
            return {
              id: issue.id,
              identifier: issue.identifier,
              number: issue.number,
              title: issue.title,
              description: issue.description,
              
              // Status
              status: state ? {
                id: state.id,
                name: state.name,
                type: state.type,
                color: state.color
              } : null,
              
              // Relationships
              assignee: assignee ? {
                id: assignee.id,
                name: assignee.name,
                email: assignee.email
              } : null,
              
              creator: creator ? {
                id: creator.id,
                name: creator.name,
                email: creator.email
              } : null,
              
              project: project ? { 
                id: project.id, 
                name: project.name,
                state: project.state 
              } : null,
              
              team: team ? { 
                id: team.id, 
                name: team.name, 
                key: team.key 
              } : null,
              
              cycle: cycle ? {
                id: cycle.id,
                name: cycle.name,
                number: cycle.number
              } : null,
              
              parent: parent ? {
                id: parent.id,
                title: parent.title,
                identifier: parent.identifier
              } : null,
              
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
              reactionData: issue.reactionData
            };
          })
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
        const args = request.params.arguments as unknown as UpdateIssueArgs;
        if (!args?.issueId) {
          throw new Error("Issue ID is required");
        }

        const issue = await linearClient.issue(args.issueId);
        if (!issue) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Issue not found: ${args.issueId}`
          );
        }

        const updatedIssue = await issue.update({
          title: args.title,
          description: args.description,
          stateId: args.status,
          assigneeId: args.assigneeId,
          labelIds: args.labels,
          priority: args.priority,
        });

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
            `Failed to list teams: ${error.message}`
          );
        }
      }

      case "list_projects": {
        const args = request.params.arguments as unknown as ListProjectsArgs;
        
        const { first = 50, after, orderBy, teamId, id, name, state, createdAfter, createdBefore, 
          updatedAfter, updatedBefore, startDate, targetDate, completedAfter, completedBefore, 
          canceledAfter, canceledBefore, health, priority, creatorId, leadId, hasBlocking, hasBlocked } = args;
        
        // Build the filter object based on provided arguments
        const filter: any = {};
        
        if (id) filter.id = { eq: id };
        if (name) filter.name = { contains: name };
        if (state) filter.state = { eq: state };
        if (teamId) filter.accessibleTeams = { some: { id: { eq: teamId } } };
        if (health) filter.health = { eq: health };
        if (priority !== undefined) filter.priority = { eq: priority };
        
        if (creatorId) filter.creator = { id: { eq: creatorId } };
        if (leadId) filter.lead = { id: { eq: leadId } };
        
        // Date filters
        if (createdAfter || createdBefore) {
          filter.createdAt = {};
          if (createdAfter) filter.createdAt.gte = createdAfter;
          if (createdBefore) filter.createdAt.lte = createdBefore;
        }
        
        if (updatedAfter || updatedBefore) {
          filter.updatedAt = {};
          if (updatedAfter) filter.updatedAt.gte = updatedAfter;
          if (updatedBefore) filter.updatedAt.lte = updatedBefore;
        }
        
        if (startDate) filter.startDate = { eq: startDate };
        if (targetDate) filter.targetDate = { eq: targetDate };
        
        if (completedAfter || completedBefore) {
          filter.completedAt = {};
          if (completedAfter) filter.completedAt.gte = completedAfter;
          if (completedBefore) filter.completedAt.lte = completedBefore;
        }
        
        if (canceledAfter || canceledBefore) {
          filter.canceledAt = {};
          if (canceledAfter) filter.canceledAt.gte = canceledAfter;
          if (canceledBefore) filter.canceledAt.lte = canceledBefore;
        }
        
        if (hasBlocking) filter.hasBlockingRelations = { exists: hasBlocking };
        if (hasBlocked) filter.hasBlockedByRelations = { exists: hasBlocked };
        
        // Prepare query options
        const queryVariables: any = {
          first,
          filter
        };
        
        if (after) queryVariables.after = after;
        if (orderBy) queryVariables.orderBy = orderBy;

        try {
          // Use the SDK's projects method instead of raw GraphQL
          const projectsConnection = await linearClient.projects(queryVariables);
          
          // Process the projects data
          const projects = await Promise.all(
            projectsConnection.nodes.map(async (project) => {
              // Fetch related data for each project
              const [creator, lead, teams] = await Promise.all([
                project.creator,
                project.lead,
                project.teams ? project.teams() : { nodes: [] }
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
                priority: project.priority !== undefined ? project.priority : null,
                creator: creator ? {
                  id: creator.id,
                  name: creator.name,
                  email: creator.email
                } : null,
                lead: lead ? {
                  id: lead.id,
                  name: lead.name,
                  email: lead.email
                } : null,
                teams: teams && teams.nodes ? 
                  teams.nodes.map((team: any) => ({
                    id: team.id,
                    name: team.name,
                    key: team.key
                  })) : []
              };
            })
          );

          // Include pagination information
          const responseData = {
            projects,
            pageInfo: {
              hasNextPage: projectsConnection.pageInfo.hasNextPage,
              endCursor: projectsConnection.pageInfo.endCursor
            }
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
            `Failed to list projects: ${error.message}`
          );
        }
      }

      case "search_issues": {
        const args = request.params.arguments as unknown as SearchIssuesArgs;
        if (!args?.query) {
          throw new Error("Search query is required");
        }

        const searchResults = await linearClient.searchIssues(args.query, {
          first: args?.first ?? 50,
        });

        const formattedResults = await Promise.all(
          searchResults.nodes.map(async (result) => {
            const state = await result.state;
            const assignee = await result.assignee;
            return {
              id: result.id,
              title: result.title,
              status: state ? await state.name : "Unknown",
              assignee: assignee ? assignee.name : "Unassigned",
              priority: result.priority,
              url: result.url,
              metadata: result.metadata,
            };
          })
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(formattedResults, null, 2),
            },
          ],
        };
      }

      case "get_issue": {
        const args = request.params.arguments as unknown as GetIssueArgs;
        if (!args?.issueId) {
          throw new Error("Issue ID is required");
        }

        const issue = await linearClient.issue(args.issueId);
        if (!issue) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Issue not found: ${args.issueId}`
          );
        }

        try {
          const [
            state,
            assignee,
            creator,
            team,
            project,
            parent,
            cycle,
            labels,
            comments,
            attachments,
          ] = await Promise.all([
            issue.state,
            issue.assignee,
            issue.creator,
            issue.team,
            issue.project,
            issue.parent,
            issue.cycle,
            issue.labels(),
            issue.comments(),
            issue.attachments(),
          ]);

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
              }))
            ),
            comments: await Promise.all(
              comments.nodes.map(async (comment: any) => ({
                id: comment.id,
                body: comment.body,
                createdAt: comment.createdAt,
              }))
            ),
            attachments: await Promise.all(
              attachments.nodes.map(async (attachment: any) => ({
                id: attachment.id,
                title: attachment.title,
                url: attachment.url,
              }))
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
                attachment.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
              )
              .map(async (attachment: any) => ({
                id: attachment.id,
                title: attachment.title,
                url: attachment.url,
                analysis: "Image analysis would go here", // Replace with actual image analysis if available
              }))
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(issueDetails, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error processing issue details:", error);
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to process issue details: ${error.message}`
          );
        }
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
            orderBy: args?.orderBy as any
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
                creator: creator ? {
                  id: creator.id,
                  name: creator.name
                } : null
              };
              
              // Only fetch projects if explicitly requested to avoid rate limiting
              if (args?.includeProjects) {
                try {
                  const projectsConnection = await roadmap.projects({
                    first: 50,
                    includeArchived: args?.includeArchived
                  });
                  
                  return {
                    ...roadmapObj,
                    projectIds: projectsConnection.nodes.map(project => project.id)
                  };
                } catch (projectError: any) {
                  // If we hit rate limits when fetching projects, return roadmap without projects
                  if (projectError.message && projectError.message.includes('Rate limit exceeded')) {
                    console.error(`Rate limit hit while fetching projects for roadmap ${roadmap.id}`);
                    return {
                      ...roadmapObj,
                      projectIds: [],
                      projectsError: "Projects not loaded due to rate limiting"
                    };
                  }
                  throw projectError;
                }
              }
              
              // Return roadmap without projects if not requested
              return roadmapObj;
            })
          );

          // Include pagination information
          const responseData = {
            roadmaps,
            pagination: {
              hasNextPage: roadmapsConnection.pageInfo.hasNextPage,
              hasPreviousPage: roadmapsConnection.pageInfo.hasPreviousPage,
              startCursor: roadmapsConnection.pageInfo.startCursor,
              endCursor: roadmapsConnection.pageInfo.endCursor
            }
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
          if (error.message && error.message.includes('Rate limit exceeded')) {
            throw new McpError(
              ErrorCode.InternalError,
              `Linear API rate limit exceeded. Try again later or use smaller page sizes. For more information see: https://developers.linear.app/docs/graphql/working-with-the-graphql-api/rate-limiting`
            );
          }
          
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to list roadmaps: ${error.message}`
          );
        }
      }

      case "get_initiative": {
        const args = request.params.arguments as unknown as GetInitiativeArgs;
        const initiative = await linearClient.initiative(args.initiativeId);
        
        if (!initiative) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Initiative not found: ${args.initiativeId}`
          );
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(initiative, null, 2),
            },
          ],
        };
      }

      // Comment tool handlers
      case "create_comment": {
        const args = request.params.arguments as unknown as CreateCommentArgs;
        
        try {
          const issue = await linearClient.issue(args.issueId);
          if (!issue) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Issue not found: ${args.issueId}`
            );
          }
          
          const comment = await linearClient.createComment({
            issueId: args.issueId,
            body: args.body,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(comment, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to create comment: ${error.message}`
          );
        }
      }

      case "get_comment": {
        const args = request.params.arguments as unknown as GetCommentArgs;
        
        try {
          // Use the GraphQL client directly since the SDK doesn't expose comment by ID directly
        const query = `
            query Comment($id: String!) {
              comment(id: $id) {
                id
                body
                createdAt
                updatedAt
                user {
              id
              name
                  email
                }
                issue {
                  id
                  title
                  identifier
                }
              }
            }
          `;
          
          const variables = {
            id: args.commentId,
          };
          
          const result = await linearClient.client.rawRequest(query, variables);
          const data = result.data as { comment: any };
          const comment = data.comment;
          
          if (!comment) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Comment not found: ${args.commentId}`
            );
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(comment, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to get comment: ${error.message}`
          );
        }
      }

      case "update_comment": {
        const args = request.params.arguments as unknown as UpdateCommentArgs;
        
        try {
          // Use the GraphQL client directly since the SDK doesn't expose comment by ID directly
          const getQuery = `
            query Comment($id: String!) {
              comment(id: $id) {
                id
              }
            }
          `;
          
          const getVariables = {
            id: args.commentId,
          };
          
          const getResult = await linearClient.client.rawRequest(getQuery, getVariables);
          const getData = getResult.data as { comment: any };
          const comment = getData.comment;
          
          if (!comment) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Comment not found: ${args.commentId}`
            );
          }
          
          const updateQuery = `
            mutation CommentUpdate($id: String!, $input: CommentUpdateInput!) {
              commentUpdate(id: $id, input: $input) {
                success
                comment {
                  id
                  body
              createdAt
              updatedAt
                }
              }
            }
          `;
          
          const updateVariables = {
            id: args.commentId,
            input: {
              body: args.body,
            },
          };
          
          const updateResult = await linearClient.client.rawRequest(updateQuery, updateVariables);
          const updateData = updateResult.data as { commentUpdate: { success: boolean; comment: any } };
          
          if (!updateData.commentUpdate.success) {
            throw new McpError(
              ErrorCode.InternalError,
              "Failed to update comment"
            );
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(updateData.commentUpdate.comment, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to update comment: ${error.message}`
          );
        }
      }

      case "delete_comment": {
        const args = request.params.arguments as unknown as DeleteCommentArgs;
        
        try {
          // Use the GraphQL client directly since the SDK doesn't expose comment by ID directly
          const getQuery = `
            query Comment($id: String!) {
              comment(id: $id) {
                id
              }
            }
          `;
          
          const getVariables = {
            id: args.commentId,
          };
          
          const getResult = await linearClient.client.rawRequest(getQuery, getVariables);
          const getData = getResult.data as { comment: any };
          const comment = getData.comment;
          
          if (!comment) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Comment not found: ${args.commentId}`
            );
          }
          
          const deleteQuery = `
            mutation CommentDelete($id: String!) {
              commentDelete(id: $id) {
                success
              }
            }
          `;
          
          const deleteVariables = {
            id: args.commentId,
          };
          
          const deleteResult = await linearClient.client.rawRequest(deleteQuery, deleteVariables);
          const deleteData = deleteResult.data as { commentDelete: { success: boolean } };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ success: deleteData.commentDelete.success }, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to delete comment: ${error.message}`
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
                `Team not found: ${teamId}`
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
            `Failed to list labels: ${error.message}`
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
              `Team not found: ${args.teamId}`
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
            `Failed to create label: ${error.message}`
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
              `Label not found: ${args.labelId}`
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
            `Failed to update label: ${error.message}`
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
                `Team not found: ${teamId}`
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
            team: cycle.team ? {
              id: cycle.team.id,
              name: cycle.team.name,
              key: cycle.team.key,
            } : null,
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
            `Failed to list cycles: ${error.message}`
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
              `Team not found: ${args.teamId}`
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
            `Failed to create cycle: ${error.message}`
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
              `Cycle not found: ${args.cycleId}`
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
            `Failed to update cycle: ${error.message}`
          );
        }
      }

      // Document tool handlers
      case "list_documents": {
        const args = request.params.arguments as unknown as ListDocumentsArgs;
        const { teamId, first = 50 } = args;
        
        try {
          let query;
          let documents = [];
          
          if (teamId) {
            // Use GraphQL directly since the SDK doesn't expose team.documents
            const teamDocumentsQuery = `
              query TeamDocuments($teamId: String!, $first: Int!) {
                team(id: $teamId) {
                  documents(first: $first) {
                    nodes {
                      id
                      title
                      url
                      createdAt
                      updatedAt
              creator {
                id
                name
              }
                      team {
                id
                name
                        key
              }
                      project {
                  id
                  name
              }
                    }
                  }
                }
              }
            `;
            
            const variables = {
              teamId,
              first,
            };
            
            const result = await linearClient.client.rawRequest(teamDocumentsQuery, variables);
            const data = result.data as { team: { documents: { nodes: any[] } } };
            
            if (!data.team) {
              throw new McpError(
                ErrorCode.MethodNotFound,
                `Team not found: ${teamId}`
              );
            }
            
            documents = data.team.documents.nodes;
          } else {
            // If no team ID, fetch all documents
            const allDocumentsQuery = `
              query AllDocuments($first: Int!) {
                documents(first: $first) {
                  nodes {
                    id
                    title
                    url
                    createdAt
                    updatedAt
                    creator {
                    id
                    name
                  }
                    team {
                      id
                      name
                      key
                    }
                    project {
                      id
                      name
                }
              }
            }
        `;
        
        const variables = {
              first,
            };
            
            const result = await linearClient.client.rawRequest(allDocumentsQuery, variables);
            const data = result.data as { documents: { nodes: any[] } };
            documents = data.documents.nodes;
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
            `Failed to list documents: ${error.message}`
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
              `Team not found: ${args.teamId}`
            );
          }
          
          // Check if project exists if provided
          if (args.projectId) {
            const project = await linearClient.project(args.projectId);
            if (!project) {
              throw new McpError(
                ErrorCode.MethodNotFound,
                `Project not found: ${args.projectId}`
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
            `Failed to create document: ${error.message}`
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
              `Document not found: ${args.documentId}`
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
            `Failed to update document: ${error.message}`
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
            `Failed to list users: ${error.message}`
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
              `User not found: ${args.userId}`
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
            `Failed to get user: ${error.message}`
          );
        }
      }

      case "me": {
        try {
          const user = await linearClient.viewer;
          
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
            `Failed to get authenticated user: ${error.message}`
          );
        }
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
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
