import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error.";
import logger from "../utils/logger";
import { ApiResponse } from "../utils/apiResponse.utils";
import { HTTP_MESSAGES, HTTP_STATUS } from "../constants/messages/http.messages.constants";
import { ZodError, z } from "zod";

export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction) {
    if (err instanceof ZodError)
        return ApiResponse.validationError(res, HTTP_MESSAGES.VALIDATION_ERROR, z.treeifyError(err));

    if (err instanceof AppError) {
        if (err.isOperational) {
            logger.error(err.message);

            console.log('this is error message form auth error',err.message)
            return ApiResponse.error(res, err.message, null, err.statusCode);
        }
        
        // logger.error(err.message);
        
        console.log('this is error message form auth error',err.message)
        return ApiResponse.error(res, HTTP_MESSAGES.SERVER_ERROR, null, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return ApiResponse.error(res, HTTP_MESSAGES.SERVER_ERROR, null, HTTP_STATUS.INTERNAL_SERVER_ERROR);





    
}

export default errorHandler;
