import { NextFunction, Request, Response } from "express";
import { AuthError } from "../errors-classes/auth.error";
import { HTTP_MESSAGES, HTTP_STATUS } from "../constants/messages/http.messages.constants";
import { userRepo } from "../dependencies/container.dependency";
import { USER_AUTH_MESSAGES } from "../constants/messages/user.messages.constants";

export async function isUserBlocked(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.user;

        if (!user) {
            return next(new AuthError(HTTP_MESSAGES.UNAUTHORIZED));
        }

        const userData = await userRepo.findById(user.id);

        if (!userData) {
            return next(new AuthError(USER_AUTH_MESSAGES.USER_NOT_FOUND));
        }

        if (userData.isBlocked) {
            return next(new AuthError(HTTP_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
        }

        next();
    } catch (error) {
        next(error);
    }
}
