/**
 * Error codes for MCP errors
 */
export enum ErrorCode {
  InternalError = "INTERNAL_ERROR",
  MethodNotFound = "METHOD_NOT_FOUND",
  InvalidArguments = "INVALID_ARGUMENTS",
  Unauthorized = "UNAUTHORIZED",
  RateLimitExceeded = "RATE_LIMIT_EXCEEDED",
}

/**
 * Custom error class for MCP-specific errors
 */
export class McpError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "McpError";
  }
}
