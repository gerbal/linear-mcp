import { z } from "zod";

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
  projectId: z.string().optional(),
  creatorId: z.string().optional(),
  priority: z.number().min(0).max(4).optional(),
  dueDate: z.string().optional(),
  dueDateGte: z.string().optional(),
  dueDateLte: z.string().optional(),
  first: z.number().optional(),
});

// Comment schemas
export const createCommentSchema = z.object({
  issueId: z.string(),
  body: z.string(),
});

export const updateCommentSchema = z.object({
  commentId: z.string(),
  body: z.string(),
});

export const deleteCommentSchema = z.object({
  commentId: z.string(),
});

// Type definitions for request arguments
export interface GetCommentArgs {
  commentId: string;
}

export interface GetUserArgs {
  userId: string;
}

// Team schemas
export const getTeamSchema = z.object({
  teamId: z.string(),
});

export const listTeamsSchema = z.object({
  first: z.number().optional(),
});

// Project schemas
export const getProjectSchema = z.object({
  projectId: z.string(),
});

export const listProjectsSchema = z.object({
  teamId: z.string().optional(),
  first: z.number().optional(),
});

// Issue schemas (additional)
export const getIssueSchema = z.object({
  issueId: z.string(),
});

export const searchIssuesSchema = z.object({
  query: z.string(),
  first: z.number().optional(),
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

// Roadmap schemas
export const getRoadmapSchema = z.object({
  roadmapId: z.string(),
});

export const listRoadmapsSchema = z.object({
  first: z.number().optional(),
});

// Initiative schemas
export const getInitiativeSchema = z.object({
  initiativeId: z.string(),
});

// Label schemas
export const getLabelSchema = z.object({
  labelId: z.string(),
});

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
export const getCycleSchema = z.object({
  cycleId: z.string(),
});

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
export const getDocumentSchema = z.object({
  documentId: z.string(),
});

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

// User schemas (additional)
export const listUsersSchema = z.object({
  first: z.number().optional(),
});

// Additional type definitions
export interface GetTeamArgs {
  teamId: string;
}

export interface GetProjectArgs {
  projectId: string;
}

export interface GetIssueArgs {
  issueId: string;
}

export interface GetRoadmapArgs {
  roadmapId: string;
}

export interface GetInitiativeArgs {
  initiativeId: string;
}

export interface GetLabelArgs {
  labelId: string;
}

export interface GetCycleArgs {
  cycleId: string;
}

export interface GetDocumentArgs {
  documentId: string;
}
