import { ZodSchema } from "zod";

import { Request, Response, NextFunction } from "express";

export type IRequestObjects = "body" | "params" | "query" | "user" | "cookies";
export const validate =
    (schema: ZodSchema, sources: IRequestObjects[]) => (req: Request, res: Response, next: NextFunction) => {
        try {
            for (const source of sources) {
                const result = schema.safeParse(req[source]);

                if (!result.success) {
                    // return ApiResponse.validationError(
                    //     res,
                    //     HTTP_MESSAGES.VALIDATION_ERROR,
                    //     result.error.flatten().fieldErrors,
                    // );

                    return next(result.error.flatten().fieldErrors);
                }

                req[source] = result.data;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
