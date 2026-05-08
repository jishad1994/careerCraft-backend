import { ZodSchema } from "zod";

import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../errors-classes/validation.error";
import logger from "../utils/logger";

export type IRequestObjects = "body" | "params" | "query" | "user" | "cookies";

const formatZodErrorMessage = (fieldErrors: Record<string, string[] | undefined>): string => {
    return Object.entries(fieldErrors)
        .map(([field, messages]) => {
            const message = messages?.join(", ") ?? "Invalid value";
            return `${field}: ${message}`;
        })
        .join("; ");
};

export const validate = (schema: ZodSchema, sources: IRequestObjects[]) => (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        for (const source of sources) {
            const result = schema.safeParse(req[source]);

            if (!result.success) {
                logger.error("validation error:", result.error.flatten().fieldErrors);
                const fieldErrors = result.error.flatten().fieldErrors;
                const message = formatZodErrorMessage(fieldErrors);

                return next(new ValidationError(message || "Validation failed"));
            }

            req[source] = result.data;
        }

        next();
    } catch (error) {
        next(error);
    }
};
