import { ZodSchema } from "zod";

import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/apiResponse.utils";
import { HTTP_MESSAGES } from "../constants/http.constants";

export type IRequestObjects = "body" | "params" | "query" | "user" | "cookies";
export const validate =
    (schema: ZodSchema, sources: IRequestObjects[]) => (req: Request, res: Response, next: NextFunction) => {
        for (const source of sources) {
            const result = schema.safeParse(req[source]);

            if (!result.success) {
                return ApiResponse.validationError(res, HTTP_MESSAGES.VALIDATION_ERROR, result.error.flatten().fieldErrors);
            }

            req[source] = result.data;
        }

        next();
    };
