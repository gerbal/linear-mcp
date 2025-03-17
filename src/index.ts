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
        list_initiatives: true,
        get_initiative: true,
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
      name: "list_initiatives",
      description: "List all initiatives (roadmap items)",
      inputSchema: {
        type: "object",
        properties: {
          first: {
            type: "number",
            description: "Number of initiatives to return from the beginning (default: 50)",
          },
          last: {
            type: "number",
            description: "Number of initiatives to return from the end (alternative to first)",
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
            description: "Include archived initiatives (default: false)",
          },
          orderBy: {
            type: "string",
            description: "Sort initiatives by field (createdAt, updatedAt)",
            enum: ["createdAt", "updatedAt"],
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

type ListProjectsArgs = {
  teamId?: string;
  first?: number;
};

type SearchIssuesArgs = {
  query: string;
  first?: number;
};

type GetIssueArgs = {
  issueId: string;
};

type ListInitiativesArgs = {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
  includeArchived?: boolean;
  orderBy?: "createdAt" | "updatedAt";
};

type GetInitiativeArgs = {
  initiativeId: string;
};

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
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
        if (args?.teamId) filter.team = { id: { eq: args.teamId } };
        if (args?.assigneeId) filter.assignee = { id: { eq: args.assigneeId } };
        if (args?.status) filter.state = { name: { eq: args.status } };

        const issues = await linearClient.issues({
          first: args?.first ?? 50,
          filter,
        });

        const formattedIssues = await Promise.all(
          issues.nodes.map(async (issue) => {
            const state = await issue.state;
            const assignee = await issue.assignee;
            return {
              id: issue.id,
              title: issue.title,
              status: state ? await state.name : "Unknown",
              assignee: assignee ? assignee.name : "Unassigned",
              priority: issue.priority,
              url: issue.url,
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
          throw new Error(`Issue ${args.issueId} not found`);
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
        const query = await linearClient.teams();
        const teams = await Promise.all(
          (query as any).nodes.map(async (team: any) => ({
            id: team.id,
            name: team.name,
            key: team.key,
            description: team.description,
          }))
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(teams, null, 2),
            },
          ],
        };
      }

      case "list_projects": {
        const args = request.params.arguments as unknown as ListProjectsArgs;
        
        // Use the correct filter based on the GraphQL schema
        let queryStr;
        if (args?.teamId) {
          queryStr = `
            query Projects($first: Int, $teamId: String) {
              projects(first: $first, filter: {teams: {some: {id: {eq: $teamId}}}}) {
                nodes {
                  id
                  name
                  description
                  state
                  teams {
                    nodes {
                      id
                      name
                      key
                    }
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
          `;
        } else {
          queryStr = `
            query Projects($first: Int) {
              projects(first: $first) {
                nodes {
                  id
                  name
                  description
                  state
                  teams {
                    nodes {
                      id
                      name
                      key
                    }
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
          `;
        }
        
        const variables = {
          first: args?.first ?? 50,
          ...(args?.teamId ? { teamId: args.teamId } : {})
        };

        const result = await linearClient.client.rawRequest(queryStr, variables);
        const data = result.data as { 
          projects: { 
            nodes: any[],
            pageInfo: {
              hasNextPage: boolean,
              endCursor: string
            } 
          } 
        };
        
        // Check if data and nodes exist to prevent "map of undefined" error
        if (!data.projects || !data.projects.nodes) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify([], null, 2),
              },
            ],
          };
        }
        
        const projects = data.projects.nodes.map((project: any) => ({
          id: project.id,
          name: project.name,
          description: project.description,
          state: project.state,
          teams: project.teams && project.teams.nodes ? 
            project.teams.nodes.map((team: any) => ({
              id: team.id,
              name: team.name,
              key: team.key
            })) : []
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(projects, null, 2),
            },
          ],
        };
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
          throw new Error(`Issue ${args.issueId} not found`);
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
          throw new Error(`Failed to process issue details: ${error.message}`);
        }
      }

      case "list_initiatives": {
        const args = request.params.arguments as unknown as ListInitiativesArgs;
        
        const query = `
          query Initiatives($first: Int, $last: Int, $after: String, $before: String, $includeArchived: Boolean, $orderBy: PaginationOrderBy) {
            roadmaps(first: $first, last: $last, after: $after, before: $before, includeArchived: $includeArchived, orderBy: $orderBy) {
              nodes {
                id
                name
                description
                createdAt
                updatedAt
                archivedAt
                color
                url
                creator {
                  id
                  name
                }
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
              }
            }
          }
        `;
        
        const variables = {
          first: args?.first ?? (args?.last ? null : 50),
          last: args?.last ?? null,
          after: args?.after ?? null,
          before: args?.before ?? null,
          includeArchived: args.includeArchived || false,
          orderBy: args.orderBy || "updatedAt",
        };

        const queryResult = await linearClient.client.rawRequest(query, variables);
        // Type assertion for queryResult.data with correct shape including pageInfo
        const data = queryResult.data as { 
          roadmaps: { 
            nodes: any[],
            pageInfo: {
              hasNextPage: boolean,
              hasPreviousPage: boolean,
              startCursor: string,
              endCursor: string
            } 
          } 
        };
        
        // Simply use the data returned by the API
        let initiatives = data.roadmaps.nodes;
        
        // Note: The Linear API doesn't directly support filtering roadmaps by name or creator
        // For transparency, we're not applying any client-side filtering
        // If filtering is needed, it should be done by the client using the raw results
        
        // Map to the format we want to return
        const formattedInitiatives = initiatives.map((initiative: any) => ({
          id: initiative.id,
          name: initiative.name,
          description: initiative.description,
          createdAt: initiative.createdAt,
          updatedAt: initiative.updatedAt,
          archivedAt: initiative.archivedAt,
          color: initiative.color,
          url: initiative.url,
          creator: initiative.creator ? {
            id: initiative.creator.id,
            name: initiative.creator.name
          } : null
        }));

        // Include pagination information
        const responseData = {
          initiatives: formattedInitiatives,
          pagination: {
            hasNextPage: data.roadmaps.pageInfo.hasNextPage,
            hasPreviousPage: data.roadmaps.pageInfo.hasPreviousPage,
            startCursor: data.roadmaps.pageInfo.startCursor,
            endCursor: data.roadmaps.pageInfo.endCursor
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
      }

      case "get_initiative": {
        const args = request.params.arguments as unknown as GetInitiativeArgs;
        if (!args?.initiativeId) {
          throw new Error("Initiative ID is required");
        }

        // Use the GraphQL client directly since the SDK doesn't expose initiatives
        const query = `
          query Initiative($id: String!) {
            roadmap(id: $id) {
              id
              name
              description
              createdAt
              updatedAt
              archivedAt
              color
              url
              slugId
              sortOrder
              creator {
                id
                name
                email
              }
              owner {
                id
                name
                email
              }
              projects(first: 10) {
                nodes {
                  id
                  name
                  description
                  state
                  color
                  url
                  lead {
                    id
                    name
                  }
                  teams(first: 5) {
                    nodes {
                      id
                      name
                      key
                    }
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
          }
        `;
        
        const variables = {
          id: args.initiativeId,
        };

        try {
          const result = await linearClient.client.rawRequest(query, variables);
          // Type assertion for result.data
          const data = result.data as { roadmap: any };
          const initiative = data.roadmap;
          
          if (!initiative) {
            throw new Error(`Initiative ${args.initiativeId} not found`);
          }

          const initiativeDetails = {
            id: initiative.id,
            name: initiative.name,
            description: initiative.description,
            createdAt: initiative.createdAt,
            updatedAt: initiative.updatedAt,
            archivedAt: initiative.archivedAt,
            slugId: initiative.slugId,
            sortOrder: initiative.sortOrder,
            color: initiative.color,
            url: initiative.url,
            creator: initiative.creator ? {
              id: initiative.creator.id,
              name: initiative.creator.name,
              email: initiative.creator.email,
            } : null,
            owner: initiative.owner ? {
              id: initiative.owner.id,
              name: initiative.owner.name,
              email: initiative.owner.email,
            } : null,
            projects: initiative.projects && initiative.projects.nodes ? 
              initiative.projects.nodes.map((project: any) => ({
                id: project.id,
                name: project.name,
                description: project.description,
                state: project.state,
                color: project.color,
                url: project.url,
                lead: project.lead ? {
                  id: project.lead.id,
                  name: project.lead.name
                } : null,
                teams: project.teams && project.teams.nodes ? 
                  project.teams.nodes.map((team: any) => ({
                    id: team.id,
                    name: team.name,
                    key: team.key
                  })) : [],
              })) : [],
            hasMoreProjects: initiative.projects && initiative.projects.pageInfo ? 
              initiative.projects.pageInfo.hasNextPage : false
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
          console.error("Error processing initiative details:", error);
          throw new Error(`Failed to process initiative details: ${error.message}`);
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
