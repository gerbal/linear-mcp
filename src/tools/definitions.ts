import { Tool } from "../types.js";

// Read-only tools that are always available
export const READ_TOOLS: Tool[] = [
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
        first: {
          type: "number",
          description: "Number of issues to return (default: 50)",
        },
      },
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
    description: "Get team details",
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
    description: "List all projects",
    inputSchema: {
      type: "object",
      properties: {
        teamId: {
          type: "string",
          description: "Filter by team ID (optional)",
        },
        first: {
          type: "number",
          description: "Number of projects to return (default: 50)",
        },
      },
    },
  },
  {
    name: "get_project",
    description: "Get project details",
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
    name: "search_issues",
    description: "Search for issues using query text",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query text",
        },
        first: {
          type: "number",
          description: "Number of issues to return (default: 50)",
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
    description: "List all roadmaps",
    inputSchema: {
      type: "object",
      properties: {
        first: {
          type: "number",
          description: "Number of roadmaps to return (default: 50)",
        },
      },
    },
  },
  {
    name: "get_roadmap",
    description: "Get roadmap details",
    inputSchema: {
      type: "object",
      properties: {
        roadmapId: {
          type: "string",
          description: "Roadmap ID",
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
  {
    name: "get_comment",
    description: "Get a specific comment",
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
    description: "Get label details",
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
    description: "Get cycle details",
    inputSchema: {
      type: "object",
      properties: {
        cycleId: {
          type: "string",
          description: "Cycle ID",
        },
      },
      required: ["cycleId"],
    },
  },
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
    description: "Get document details",
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
];

// Write tools that are only available when not in read-only mode
export const WRITE_TOOLS: Tool[] = [
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
        labels: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Label IDs to apply (optional)",
        },
      },
      required: ["issueId"],
    },
  },
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
];
