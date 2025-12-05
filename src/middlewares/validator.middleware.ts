import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ApiResponse } from "../utils/apiResponse.utils";

export const validatorRequest = (schema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const formattedErrors = result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));

        return ApiResponse.validationError(res, "invalid credentials", formattedErrors);
    }
    req.body = result.data;
    next(req);
};
