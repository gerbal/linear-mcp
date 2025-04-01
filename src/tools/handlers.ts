import { LinearClient } from "@linear/sdk";
import { McpError, ErrorCode } from "../errors.js";
import { validateRequest } from "../utils.js";
import {
  createIssueSchema,
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
  listIssuesSchema,
  getTeamSchema,
  listTeamsSchema,
  getProjectSchema,
  listProjectsSchema,
  getIssueSchema,
  searchIssuesSchema,
  updateIssueSchema,
  getRoadmapSchema,
  listRoadmapsSchema,
  getInitiativeSchema,
  getLabelSchema,
  listLabelsSchema,
  createLabelSchema,
  updateLabelSchema,
  getCycleSchema,
  listCyclesSchema,
  createCycleSchema,
  updateCycleSchema,
  getDocumentSchema,
  listDocumentsSchema,
  createDocumentSchema,
  updateDocumentSchema,
  listUsersSchema,
  GetCommentArgs,
  GetUserArgs,
  GetTeamArgs,
  GetProjectArgs,
  GetIssueArgs,
  GetRoadmapArgs,
  GetInitiativeArgs,
  GetLabelArgs,
  GetCycleArgs,
  GetDocumentArgs,
} from "../schemas.js";

export class ToolHandlers {
  constructor(private linearClient: LinearClient) {}

  // Issue handlers
  async handleCreateIssue(request: any) {
    try {
      const args = validateRequest(createIssueSchema, request.params.arguments);

      const issue = await this.linearClient.createIssue({
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
    } catch (error: any) {
      // No logging - would break STDIO communication
      return {
        content: [
          {
            type: "text",
            text: `Failed to create issue: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async handleListIssues(request: any) {
    const args = validateRequest(listIssuesSchema, request.params.arguments);

    const filter: Record<string, any> = {};

    if (args?.teamId) filter.team = { id: { eq: args.teamId } };
    if (args?.assigneeId) filter.assignee = { id: { eq: args.assigneeId } };
    if (args?.status) filter.state = { name: { eq: args.status } };
    if (args?.projectId) filter.project = { id: { eq: args.projectId } };
    if (args?.creatorId) filter.creator = { id: { eq: args.creatorId } };
    if (args?.priority !== undefined) filter.priority = { eq: args.priority };

    if (args?.dueDate || args?.dueDateGte || args?.dueDateLte) {
      filter.dueDate = {};
      if (args.dueDate) filter.dueDate.eq = args.dueDate;
      if (args.dueDateGte) filter.dueDate.gte = args.dueDateGte;
      if (args.dueDateLte) filter.dueDate.lte = args.dueDateLte;
    }

    try {
      const issues = await this.linearClient.issues({
        filter,
        first: args?.first || 50,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(issues.nodes, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list issues: ${error.message}`,
      );
    }
  }

  // Comment handlers
  async handleCreateComment(request: any) {
    try {
      const args = validateRequest(
        createCommentSchema,
        request.params.arguments,
      );

      const issue = await this.linearClient.issue(args.issueId);
      if (!issue) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Issue not found: ${args.issueId}`,
        );
      }

      const commentPayload = await this.linearClient.createComment({
        issueId: args.issueId,
        body: args.body,
      });

      if (!commentPayload) {
        throw new McpError(ErrorCode.InternalError, "Failed to create comment");
      }

      const commentFetch = commentPayload.comment;
      if (!commentFetch) {
        throw new McpError(
          ErrorCode.InternalError,
          "Comment was created but no comment data was returned",
        );
      }

      const comment = await commentFetch;
      const userFetch = comment.user;
      const user = userFetch ? await userFetch : null;

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
      // No logging - would break STDIO communication

      if (error instanceof McpError) {
        throw error;
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create comment: ${error.message}`,
      );
    }
  }

  async handleGetComment(request: any) {
    const args = request.params.arguments as unknown as GetCommentArgs;

    try {
      const comment = await this.linearClient.comment({ id: args.commentId });

      if (!comment) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Comment not found: ${args.commentId}`,
        );
      }

      const [user, issue] = await Promise.all([comment.user, comment.issue]);

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

  async handleUpdateComment(request: any) {
    try {
      const args = validateRequest(
        updateCommentSchema,
        request.params.arguments,
      );

      const comment = await this.linearClient.comment({
        id: args.commentId,
      });

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

  async handleDeleteComment(request: any) {
    try {
      const args = validateRequest(
        deleteCommentSchema,
        request.params.arguments,
      );

      const comment = await this.linearClient.comment({
        id: args.commentId,
      });

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

  // User handlers
  async handleGetUser(request: any) {
    const args = request.params.arguments as unknown as GetUserArgs;

    try {
      const user = await this.linearClient.user(args.userId);

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

  async handleMe() {
    try {
      const user = await this.linearClient.viewer;
      const teamsConnection = await user.teams();
      const teams = teamsConnection.nodes.map((team) => ({
        id: team.id,
        name: team.name,
        key: team.key,
      }));

      const userData = {
        ...user,
        teams,
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

  // Additional User handlers
  async handleListUsers(request: any) {
    try {
      const args = validateRequest(listUsersSchema, request.params.arguments);

      const users = await this.linearClient.users({
        first: args?.first || 50,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(users.nodes, null, 2),
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

  // Team handlers
  async handleListTeams(request: any) {
    try {
      const args = validateRequest(listTeamsSchema, request.params.arguments);
      const teams = await this.linearClient.teams({
        first: args?.first || 50,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(teams.nodes, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list teams: ${error.message}`,
      );
    }
  }

  async handleGetTeam(request: any) {
    const args = request.params.arguments as unknown as GetTeamArgs;

    try {
      const team = await this.linearClient.team(args.teamId);

      if (!team) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Team not found: ${args.teamId}`,
        );
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(team, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get team: ${error.message}`,
      );
    }
  }

  // Project handlers
  async handleListProjects(request: any) {
    try {
      const args = validateRequest(
        listProjectsSchema,
        request.params.arguments,
      );
      const filter: Record<string, any> = {};

      if (args?.teamId) {
        filter.team = { id: { eq: args.teamId } };
      }

      const projects = await this.linearClient.projects({
        filter,
        first: args?.first || 50,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(projects.nodes, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list projects: ${error.message}`,
      );
    }
  }

  async handleGetProject(request: any) {
    const args = request.params.arguments as unknown as GetProjectArgs;

    try {
      const project = await this.linearClient.project(args.projectId);

      if (!project) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Project not found: ${args.projectId}`,
        );
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(project, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get project: ${error.message}`,
      );
    }
  }

  // Additional Issue handlers
  async handleGetIssue(request: any) {
    const args = request.params.arguments as unknown as GetIssueArgs;

    try {
      const issue = await this.linearClient.issue(args.issueId);

      if (!issue) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Issue not found: ${args.issueId}`,
        );
      }

      // Fetch related resources in parallel
      const [
        attachments,
        labels,
        state,
        assignee,
        team,
        project,
        commentsConnection,
        children,
        parent
      ] = await Promise.all([
        issue.attachments(),
        issue.labels(),
        issue.state,
        issue.assignee,
        issue.team,
        issue.project,
        issue.comments({ first: 100 }), // Limit to latest 100 comments
        issue.children(),
        issue.parent
      ]);

      // Fetch comment users in parallel
      const comments = await Promise.all(
        commentsConnection.nodes.map(async (comment) => ({
          ...comment,
          user: await comment.user
        }))
      );

      // Include all related data in the response
      const issueData = {
        ...issue,
        attachments: attachments.nodes,
        labels: labels.nodes,
        state,
        assignee,
        team,
        project,
        comments,
        children: children.nodes,
        parent
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(issueData, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get issue: ${error.message}`,
      );
    }
  }

  async handleSearchIssues(request: any) {
    try {
      const args = validateRequest(
        searchIssuesSchema,
        request.params.arguments,
      );

      const issues = await this.linearClient.searchIssues(args.query, {
        first: args?.first || 50,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(issues.nodes, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to search issues: ${error.message}`,
      );
    }
  }

  async handleUpdateIssue(request: any) {
    try {
      const args = validateRequest(updateIssueSchema, request.params.arguments);

      const issue = await this.linearClient.issue(args.issueId);
      if (!issue) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Issue not found: ${args.issueId}`,
        );
      }

      const updateData: Record<string, any> = {};
      if (args.title) updateData.title = args.title;
      if (args.description) updateData.description = args.description;
      if (args.status) updateData.stateId = args.status;
      if (args.assigneeId) updateData.assigneeId = args.assigneeId;
      if (args.priority !== undefined) updateData.priority = args.priority;
      if (args.labels) updateData.labelIds = args.labels;

      const updatedIssue = await issue.update(updateData);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(updatedIssue, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to update issue: ${error.message}`,
      );
    }
  }

  // Roadmap handlers
  async handleListRoadmaps(request: any) {
    try {
      const args = validateRequest(
        listRoadmapsSchema,
        request.params.arguments,
      );

      const roadmaps = await this.linearClient.roadmaps({
        first: args?.first || 50,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(roadmaps.nodes, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list roadmaps: ${error.message}`,
      );
    }
  }

  async handleGetRoadmap(request: any) {
    const args = request.params.arguments as unknown as GetRoadmapArgs;

    try {
      const roadmap = await this.linearClient.roadmap(args.roadmapId);

      if (!roadmap) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Roadmap not found: ${args.roadmapId}`,
        );
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(roadmap, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get roadmap: ${error.message}`,
      );
    }
  }

  // Initiative handlers
  async handleGetInitiative(request: any) {
    const args = request.params.arguments as unknown as GetInitiativeArgs;

    try {
      const initiative = await this.linearClient.initiative(args.initiativeId);

      if (!initiative) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Initiative not found: ${args.initiativeId}`,
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
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get initiative: ${error.message}`,
      );
    }
  }

  // Label handlers
  async handleListLabels(request: any) {
    try {
      const args = validateRequest(listLabelsSchema, request.params.arguments);
      const filter: Record<string, any> = {};

      if (args?.teamId) {
        filter.team = { id: { eq: args.teamId } };
      }

      const labels = await this.linearClient.issueLabels({
        filter,
        first: args?.first || 50,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(labels.nodes, null, 2),
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

  async handleGetLabel(request: any) {
    const args = request.params.arguments as unknown as GetLabelArgs;

    try {
      const label = await this.linearClient.issueLabel(args.labelId);

      if (!label) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Label not found: ${args.labelId}`,
        );
      }

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
        `Failed to get label: ${error.message}`,
      );
    }
  }

  async handleCreateLabel(request: any) {
    try {
      const args = validateRequest(createLabelSchema, request.params.arguments);

      const label = await this.linearClient.createIssueLabel({
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

  async handleUpdateLabel(request: any) {
    try {
      const args = validateRequest(updateLabelSchema, request.params.arguments);

      const label = await this.linearClient.issueLabel(args.labelId);
      if (!label) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Label not found: ${args.labelId}`,
        );
      }

      const updateData: Record<string, any> = {};
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

  // Cycle handlers
  async handleListCycles(request: any) {
    try {
      const args = validateRequest(listCyclesSchema, request.params.arguments);
      const filter: Record<string, any> = {};

      if (args?.teamId) {
        filter.team = { id: { eq: args.teamId } };
      }

      const cycles = await this.linearClient.cycles({
        filter,
        first: args?.first || 50,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(cycles.nodes, null, 2),
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

  async handleGetCycle(request: any) {
    const args = request.params.arguments as unknown as GetCycleArgs;

    try {
      const cycle = await this.linearClient.cycle(args.cycleId);

      if (!cycle) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Cycle not found: ${args.cycleId}`,
        );
      }

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
        `Failed to get cycle: ${error.message}`,
      );
    }
  }

  async handleCreateCycle(request: any) {
    try {
      const args = validateRequest(createCycleSchema, request.params.arguments);

      const cycle = await this.linearClient.createCycle({
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

  async handleUpdateCycle(request: any) {
    try {
      const args = validateRequest(updateCycleSchema, request.params.arguments);

      const cycle = await this.linearClient.cycle(args.cycleId);
      if (!cycle) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Cycle not found: ${args.cycleId}`,
        );
      }

      const updateData: Record<string, any> = {};
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

  // Document handlers
  async handleListDocuments(request: any) {
    try {
      const args = validateRequest(
        listDocumentsSchema,
        request.params.arguments,
      );
      const filter: Record<string, any> = {};

      if (args?.teamId) {
        filter.team = { id: { eq: args.teamId } };
      }

      const documents = await this.linearClient.documents({
        filter,
        first: args?.first || 50,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(documents.nodes, null, 2),
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

  async handleGetDocument(request: any) {
    const args = request.params.arguments as unknown as GetDocumentArgs;

    try {
      const document = await this.linearClient.document(args.documentId);

      if (!document) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Document not found: ${args.documentId}`,
        );
      }

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
        `Failed to get document: ${error.message}`,
      );
    }
  }

  async handleCreateDocument(request: any) {
    try {
      const args = validateRequest(
        createDocumentSchema,
        request.params.arguments,
      );

      const document = await this.linearClient.createDocument({
        title: args.title,
        content: args.content,
        projectId: args.projectId,
      });

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

  async handleUpdateDocument(request: any) {
    try {
      const args = validateRequest(
        updateDocumentSchema,
        request.params.arguments,
      );

      const document = await this.linearClient.document(args.documentId);
      if (!document) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Document not found: ${args.documentId}`,
        );
      }

      const updateData: Record<string, any> = {};
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
}
