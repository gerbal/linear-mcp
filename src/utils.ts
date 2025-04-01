import { McpError, ErrorCode } from "./errors.js";
import { z } from "zod";

/**
 * Validates request arguments against a Zod schema
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidArguments,
        `Invalid arguments: ${error.errors.map((e) => e.message).join(", ")}`,
      );
    }
    throw error;
  }
}
