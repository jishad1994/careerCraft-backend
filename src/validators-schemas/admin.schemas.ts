import { z } from "zod";

// MongoDB ObjectId validation
const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID format");

// Pagination schema for query parameters
export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 1))
    .pipe(z.number().int().positive().default(1)),
  limit: z
    .optional()
    .transform((val) => (val ? Number(val) : 10))
    .pipe(z.number().int().positive().max(100).default(10)),
  search: z.string().optional().default(""),
});

// ID parameter schema
export const idParamSchema = z.object({
  id: objectIdSchema,
});

// Block/Unblock action schema
export const blockActionParamSchema = z.object({
  id: objectIdSchema,
  action: z.enum(["block", "unblock"], {
    errorMap: () => ({ message: "Action must be either 'block' or 'unblock'" }),
  }),
});

// Alternative: If you're using separate routes for block/unblock
export const blockUnblockParamSchema = z.object({
  id: objectIdSchema,
});

// Type exports
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type BlockActionParam = z.infer<typeof blockActionParamSchema>;