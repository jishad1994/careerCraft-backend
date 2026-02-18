import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import { AccessPayload, verifyAccessToken } from "../utils/jwt.utils";
import { ApiResponse } from "../utils/apiResponse.utils";
import { HTTP_MESSAGES } from "../constants/messages/http.messages.constants";

export function companyAuthMiddleware(req: Request, res: Response, next: NextFunction) {
   
    const token = req.cookies.accessToken;

    if (!token) {
        logger.error("unauthorized request expired request ");
        return ApiResponse.unauthorized(res, HTTP_MESSAGES.UNAUTHORIZED);
    }
    try {
        const payload: AccessPayload = verifyAccessToken(token);

        if (payload.role !== "company") {
            logger.error("unauthorized request expired request ");
            return ApiResponse.unauthorized(res, HTTP_MESSAGES.UNAUTHORIZED);
        }

        req.user = { id: payload.sub, role: payload.role }; //converted to more meaningfull manner

        next();
    } catch (error) {
        return ApiResponse.unauthorized(res, error instanceof Error ? error.message : HTTP_MESSAGES.SESSION_EXPIRED);
     
    }
    
}
