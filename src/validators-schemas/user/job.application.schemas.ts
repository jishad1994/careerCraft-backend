import { z } from "zod";
import { objectIdSchema } from "../auth.schemas";

// const resumeSchema = z.object({
//     originalName: z.string().min(1),
//     key: z.string().min(1),
//     signedURL: z.string().min(1).optional(),
// });

const coverLetterSchema = z
    .object({
        type: z.enum(["text", "document"]),
        content: z.string().optional(),
        fileName: z.string().optional(),
        fileUrl: z.string().optional(),
        fileKey: z.string().optional(),
        uploadedAt: z.date().optional(),
    })
    .refine((data) => (data.type === "text" && !!data.content) || (data.type === "document" && !!data.fileKey), {
        message: "Cover letter content or document is required based on type",
    });

/**
 * Screening answers
 */
const screeningAnswerSchema = z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
});

/**
 * Expected salary
 */
const expectedSalarySchema = z.object({
    amount: z.number().positive(),
    currency: z.string().default("INR"),
    period: z.enum(["monthly", "yearly"]).default("monthly"),
});

/**
 * Apply Job Request Validator
 */
export const applyJobSchema = z.object({
    job: objectIdSchema,
    company: objectIdSchema,

    // resume: resumeSchema,
    resumeFileName: z.string().min(1),

    resumeFilekey: z.string().min(1),

    coverLetter: coverLetterSchema.optional(),

    expectedSalary: expectedSalarySchema.optional(),

    availableFrom: z.coerce.date().optional(),
    noticePeriod: z.number().int().nonnegative().optional(),

    portfolioUrl: z.string().url().optional(),
    linkedinUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    otherLinks: z.array(z.string().url()).optional(),

    screeningAnswers: z.array(screeningAnswerSchema).optional(),

    source: z.enum(["direct", "referral", "job-board", "social-media", "other"]).optional(),
});
