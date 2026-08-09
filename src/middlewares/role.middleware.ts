import { Response, Request, NextFunction } from "express";
import { AuthError } from "../errors-classes/auth.error";
import { HTTP_MESSAGES, HTTP_STATUS } from "../constants/messages/http.messages.constants";

export function requiredRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AuthError(HTTP_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AuthError(HTTP_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
        }

        next();
    };
}
