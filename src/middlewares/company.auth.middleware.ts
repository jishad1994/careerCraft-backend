import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import { AccessPayload, verifyAccessToken } from "../utils/jwt.utils";
import { HTTP_MESSAGES } from "../constants/messages/http.messages.constants";
import { AppError } from "../errors-classes/app.error.";

export function companyAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.accessToken;

    if (!token) {
        logger.error("unauthorized request expired request ");
        return next(new AppError(HTTP_MESSAGES.UNAUTHORIZED, 401));
    }
    try {
        const payload: AccessPayload = verifyAccessToken(token);

        if (payload.role !== 'company') {
            logger.error("unauthorized request expired request ");
            return next(new AppError(HTTP_MESSAGES.FORBIDDEN, 403));
        }

        req.user = { id: payload.sub, role: payload.role }; //converted to more meaningfull manner

        next();
    } catch (error) {
        logger.error(error);
        return next(new AppError(HTTP_MESSAGES.SESSION_EXPIRED, 401));
    }
}
