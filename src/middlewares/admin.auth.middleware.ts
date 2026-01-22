import { Request, Response, NextFunction } from "express";
import { AccessPayload, verifyAccessToken } from "../utils/jwt.utils";
import logger from "../utils/logger";
import { ApiResponse } from "../utils/apiResponse.utils";
import { HTTP_MESSAGES } from "../constants/messages/http.messages.constants";
import { AuthCookiesSchema } from "../validators-schemas/auth.schemas";
import { AppError } from "../errors/app.error.";

export function AdminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    
    const result = AuthCookiesSchema.safeParse(req.cookies);

    if (!result.success) {
        logger.warn("Cookie validation failed", result.error.flatten());
        return ApiResponse.unauthorized(res, HTTP_MESSAGES.MISSING_TOKEN);
    }

    const { accessToken } = result.data;

    try {
        const payload: AccessPayload = verifyAccessToken(accessToken);

        if (payload.role !== "admin") {
            return ApiResponse.forbidden(res, HTTP_MESSAGES.FORBIDDEN);
        }

        req.user = { id: payload.sub, role: payload.role }; //converted to more meaningfull manner

        next();
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return ApiResponse.unauthorized(res, error.message);
        }

        logger.error("Unexpected Auth Error:", error);
        return ApiResponse.unauthorized(res, HTTP_MESSAGES.UNAUTHORIZED);
    }
}
