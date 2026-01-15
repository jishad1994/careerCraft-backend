import { z } from "zod";

// Schema for creating a new job
export const createJobSchema = z.object({
    body: z.object({
        title: z.string().min(3, "Title must be at least 3 characters").max(150, "Title too long"),

        description: z.string().min(50, "Description must be at least 50 characters"),

        responsibilities: z.array(z.string()).optional(),

        requirements: z.array(z.string()).optional(),

        employmentType: z.enum(["full-time", "part-time", "contract", "internship", "freelance"]),

        workMode: z.enum(["onsite", "remote", "hybrid"]),

        experience: z
            .object({
                min: z.number().min(0).default(0),
                max: z.number().min(0).optional(),
            })
            .optional(),

        salary: z
            .object({
                min: z.number().positive().optional(),
                max: z.number().positive().optional(),
                currency: z.string().default("INR"),
                period: z.enum(["monthly", "yearly"]).default("monthly"),
                isHidden: z.boolean().default(false),
            })
            .optional(),

        location: z.object({
            country: z.string().min(2, "Country is required"),
            state: z.string().optional(),
            city: z.string().min(2, "City is required"),
        }),

        skills: z.array(z.string()).optional(),

        openings: z.number().min(1, "At least 1 opening required").default(1),

        expiresAt: z.string().datetime().optional(),
    }),
});

// Schema for updating a job
export const updateJobSchema = z.object({
    body: z.object({
        title: z.string().min(3).max(150).optional(),

        description: z.string().min(50).optional(),

        responsibilities: z.array(z.string()).optional(),

        requirements: z.array(z.string()).optional(),

        employmentType: z.enum(["full-time", "part-time", "contract", "internship", "freelance"]).optional(),

        workMode: z.enum(["onsite", "remote", "hybrid"]).optional(),

        experience: z
            .object({
                min: z.number().min(0),
                max: z.number().min(0).optional(),
            })
            .optional(),

        salary: z
            .object({
                min: z.number().positive().optional(),
                max: z.number().positive().optional(),
                currency: z.string().optional(),
                period: z.enum(["monthly", "yearly"]).optional(),
                isHidden: z.boolean().optional(),
            })
            .optional(),

        location: z
            .object({
                country: z.string().min(2).optional(),
                state: z.string().optional(),
                city: z.string().min(2).optional(),
            })
            .optional(),

        skills: z.array(z.string()).optional(),

        openings: z.number().min(1).optional(),

        expiresAt: z.string().datetime().optional(),
    }),
});


// Schema for updating job status
export const updateJobStatusSchema = z.object({
    body: z.object({
        status: z.enum(["draft", "active", "paused", "closed"]),
    }),
});

// Export types for TypeScript
export type CreateJobInput = z.infer<typeof createJobSchema>["body"];
export type UpdateJobInput = z.infer<typeof updateJobSchema>["body"];
export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>["body"];
