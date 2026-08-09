import { Request, Response, NextFunction } from "express";
import { AccessPayload, verifyAccessToken } from "../utils/jwt.utils";
import logger from "../utils/logger";
import { HTTP_MESSAGES } from "../constants/messages/http.messages.constants";
import { AuthCookiesSchema } from "../validators-schemas/auth.schemas";
import { AppError } from "../errors-classes/app.error.";
import { AuthError } from "../errors-classes/auth.error";

export function AdminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const result = AuthCookiesSchema.safeParse(req.cookies);

  if (!result.success) {
    return next(new AppError(HTTP_MESSAGES.MISSING_TOKEN, 401));
  }

  const { accessToken } = result.data;

  try {
    const payload: AccessPayload = verifyAccessToken(accessToken);

    if (payload.role !== "admin") {
      return next(new AppError(HTTP_MESSAGES.FORBIDDEN, 403));
    }

    req.user = { id: payload.sub, role: payload.role };
    next();

  } catch (error: unknown) {
    if (error instanceof AppError) {
      return next(error);
    }

    logger.error("Unexpected Auth Error:", error);
    return next(new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401));
  }
}