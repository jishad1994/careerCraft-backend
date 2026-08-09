import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import { HTTP_MESSAGES } from "../constants/messages/http.messages.constants";
import { AccessPayload, verifyAccessToken } from "../utils/jwt.utils";
import { AuthError } from "../errors-classes/auth.error";

export function notificationAuthMiddleware(req: Request, res: Response, next: NextFunction) {
   const token = req.cookies?.accessToken;

  if (!token) {
    logger.warn("Missing access token");
    return next(new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401));
  }

  try {
    const payload: AccessPayload = verifyAccessToken(token);

    req.user = { id: payload.sub, role: payload.role };

    next();
  } catch {
    logger.warn("Invalid or expired token");

    return next(
      new AuthError(HTTP_MESSAGES.SESSION_EXPIRED, 401)
    );
  }
}
