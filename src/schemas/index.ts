import { z } from "zod";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

/**
 * Validate and parse request parameters using a Zod schema
 *
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Validated and typed data
 * @throws McpError if validation fails
 */
export function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown,
): z.infer<T> {
  try {
    const result = schema.safeParse(data);

    if (!result.success) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Validation error: ${formatZodError(result.error)}`,
      );
    }

    return result.data;
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid parameters: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Format Zod validation errors in a readable way
 */
function formatZodError(error: z.ZodError): string {
  return error.errors
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join(", ");
}

// Issue schemas
export const createIssueSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  teamId: z.string(),
  assigneeId: z.string().optional(),
  priority: z.number().min(0).max(4).optional(),
  labels: z.array(z.string()).optional(),
});

export const listIssuesSchema = z.object({
  teamId: z.string().optional(),
  assigneeId: z.string().optional(),
  status: z.string().optional(),
  first: z.number().optional(),
  projectId: z.string().optional(),
  creatorId: z.string().optional(),
  priority: z.number().min(0).max(4).optional(),
  dueDate: z.string().optional(),
  dueDateGte: z.string().optional(),
  dueDateLte: z.string().optional(),
  createdAtGte: z.string().optional(),
  createdAtLte: z.string().optional(),
  updatedAtGte: z.string().optional(),
  updatedAtLte: z.string().optional(),
  completedAtGte: z.string().optional(),
  completedAtLte: z.string().optional(),
  canceledAtGte: z.string().optional(),
  canceledAtLte: z.string().optional(),
  startedAtGte: z.string().optional(),
  startedAtLte: z.string().optional(),
  archivedAtGte: z.string().optional(),
  archivedAtLte: z.string().optional(),
  title: z.string().optional(),
  titleContains: z.string().optional(),
  description: z.string().optional(),
  descriptionContains: z.string().optional(),
  number: z.number().optional(),
  labelIds: z.array(z.string()).optional(),
  cycleId: z.string().optional(),
  parentId: z.string().optional(),
  estimate: z.number().optional(),
  estimateGte: z.number().optional(),
  estimateLte: z.number().optional(),
  isBlocked: z.boolean().optional(),
  isBlocking: z.boolean().optional(),
  isDuplicate: z.boolean().optional(),
  hasRelations: z.boolean().optional(),
  subscriberIds: z.array(z.string()).optional(),
  includeArchived: z.boolean().optional(),
  orderBy: z.enum(["createdAt", "updatedAt", "priority"]).optional(),
});

export const updateIssueSchema = z.object({
  issueId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.number().min(0).max(4).optional(),
  labels: z.array(z.string()).optional(),
});

// Project schemas
export const listProjectsSchema = z.object({
  first: z.number().optional(),
  after: z.string().optional(),
  orderBy: z.enum(["createdAt", "updatedAt"]).optional(),
  teamId: z.string().optional(),
  id: z.string().optional(),
  name: z.string().optional(),
  state: z.string().optional(),
  health: z.enum(["onTrack", "atRisk", "offTrack"]).optional(),
  priority: z.number().optional(),
  creatorId: z.string().optional(),
  leadId: z.string().optional(),
  createdAfter: z.string().optional(),
  createdBefore: z.string().optional(),
  updatedAfter: z.string().optional(),
  updatedBefore: z.string().optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  completedAfter: z.string().optional(),
  completedBefore: z.string().optional(),
  canceledAfter: z.string().optional(),
  canceledBefore: z.string().optional(),
  hasBlocking: z.boolean().optional(),
  hasBlocked: z.boolean().optional(),
});

// Search schemas
export const searchIssuesSchema = z.object({
  query: z.string(),
  first: z.number().optional(),
});

// Get issue schema
export const getIssueSchema = z.object({
  issueId: z.string(),
});

// Roadmap schemas
export const listRoadmapsSchema = z.object({
  first: z.number().optional(),
  last: z.number().optional(),
  after: z.string().optional(),
  before: z.string().optional(),
  includeArchived: z.boolean().optional(),
  orderBy: z.enum(["createdAt", "updatedAt"]).optional(),
  includeProjects: z.boolean().optional(),
});

export const getInitiativeSchema = z.object({
  initiativeId: z.string(),
});

// Comment schemas
export const createCommentSchema = z.object({
  issueId: z.string(),
  body: z.string(),
});

export const getCommentSchema = z.object({
  commentId: z.string(),
});

export const updateCommentSchema = z.object({
  commentId: z.string(),
  body: z.string(),
});

export const deleteCommentSchema = z.object({
  commentId: z.string(),
});

// Label schemas
export const listLabelsSchema = z.object({
  teamId: z.string().optional(),
  first: z.number().optional(),
});

export const createLabelSchema = z.object({
  teamId: z.string(),
  name: z.string(),
  color: z.string().optional(),
  description: z.string().optional(),
});

export const updateLabelSchema = z.object({
  labelId: z.string(),
  name: z.string().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
});

// Cycle schemas
export const listCyclesSchema = z.object({
  teamId: z.string().optional(),
  first: z.number().optional(),
});

export const createCycleSchema = z.object({
  teamId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
});

export const updateCycleSchema = z.object({
  cycleId: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Document schemas
export const listDocumentsSchema = z.object({
  teamId: z.string().optional(),
  first: z.number().optional(),
});

export const createDocumentSchema = z.object({
  title: z.string(),
  content: z.string(),
  teamId: z.string(),
  projectId: z.string().optional(),
});

export const updateDocumentSchema = z.object({
  documentId: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
});

// User schemas
export const listUsersSchema = z.object({
  first: z.number().optional(),
});

export const getUserSchema = z.object({
  userId: z.string(),
});

export const meSchema = z.object({});

export const getTeamSchema = z.object({
  teamId: z.string(),
});

export const getProjectSchema = z.object({
  projectId: z.string(),
});

export const getRoadmapSchema = z.object({
  roadmapId: z.string(),
  includeProjects: z.boolean().optional(),
  includeArchived: z.boolean().optional(),
});

export const getLabelSchema = z.object({
  labelId: z.string(),
});

export const getCycleSchema = z.object({
  cycleId: z.string(),
  includeIssues: z.boolean().optional(),
  first: z.number().optional(),
});

export const getDocumentSchema = z.object({
  documentId: z.string(),
});

// Define types from schemas
export type CreateIssueArgs = z.infer<typeof createIssueSchema>;
export type ListIssuesArgs = z.infer<typeof listIssuesSchema>;
export type UpdateIssueArgs = z.infer<typeof updateIssueSchema>;
export type ListProjectsArgs = z.infer<typeof listProjectsSchema>;
export type SearchIssuesArgs = z.infer<typeof searchIssuesSchema>;
export type GetIssueArgs = z.infer<typeof getIssueSchema>;
export type ListRoadmapsArgs = z.infer<typeof listRoadmapsSchema>;
export type GetInitiativeArgs = z.infer<typeof getInitiativeSchema>;
export type CreateCommentArgs = z.infer<typeof createCommentSchema>;
export type GetCommentArgs = z.infer<typeof getCommentSchema>;
export type UpdateCommentArgs = z.infer<typeof updateCommentSchema>;
export type DeleteCommentArgs = z.infer<typeof deleteCommentSchema>;
export type ListLabelsArgs = z.infer<typeof listLabelsSchema>;
export type CreateLabelArgs = z.infer<typeof createLabelSchema>;
export type UpdateLabelArgs = z.infer<typeof updateLabelSchema>;
export type ListCyclesArgs = z.infer<typeof listCyclesSchema>;
export type CreateCycleArgs = z.infer<typeof createCycleSchema>;
export type UpdateCycleArgs = z.infer<typeof updateCycleSchema>;
export type ListDocumentsArgs = z.infer<typeof listDocumentsSchema>;
export type CreateDocumentArgs = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentArgs = z.infer<typeof updateDocumentSchema>;
export type ListUsersArgs = z.infer<typeof listUsersSchema>;
export type GetUserArgs = z.infer<typeof getUserSchema>;
export type MeArgs = z.infer<typeof meSchema>;
export type GetTeamArgs = z.infer<typeof getTeamSchema>;
export type GetProjectArgs = z.infer<typeof getProjectSchema>;
export type GetRoadmapArgs = z.infer<typeof getRoadmapSchema>;
export type GetLabelArgs = z.infer<typeof getLabelSchema>;
export type GetCycleArgs = z.infer<typeof getCycleSchema>;
export type GetDocumentArgs = z.infer<typeof getDocumentSchema>;
