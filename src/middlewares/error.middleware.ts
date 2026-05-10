import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors-classes/app.error.";
import logger from "../utils/logger";
import { ApiResponse } from "../utils/apiResponse.utils";
import { HTTP_MESSAGES, HTTP_STATUS } from "../constants/messages/http.messages.constants";
import { ZodError } from "zod";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
    if (err instanceof ZodError) {
        logger.error("Error stack", err.stack);
        logger.error(err.message);

        return ApiResponse.validationError(res, HTTP_MESSAGES.VALIDATION_ERROR, err);
    }

    if (err instanceof AppError) {
        if (err.isOperational) {
            logger.error(err.message);
            logger.error("Error stack", err.stack);
            return ApiResponse.error(res, err.message, null, err.statusCode);
        }

        return ApiResponse.error(res, HTTP_MESSAGES.SERVER_ERROR, null, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    if (err instanceof Error) {
        logger.error("Error stack", err.stack);
        logger.error(err.message);
        return ApiResponse.error(res, err.message, null, 500);
    }

    return ApiResponse.error(res, HTTP_MESSAGES.SERVER_ERROR, null, HTTP_STATUS.INTERNAL_SERVER_ERROR);
}

export default errorHandler;
