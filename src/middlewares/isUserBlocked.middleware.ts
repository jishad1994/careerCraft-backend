import { NextFunction, Request, Response } from "express";
import { AuthError } from "../errors-classes/auth.error";
import { HTTP_MESSAGES, HTTP_STATUS } from "../constants/messages/http.messages.constants";
import { userRepo } from "../dependencies/container.dependency";
import { USER_AUTH_MESSAGES } from "../constants/messages/user.messages.constants";

export async function isUserBlocked(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.user;

        if (!user) {
            throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);
        }

        const userModel = userRepo;

        const userData = await userModel.findById(user.id);

        if (!userData) {
            throw new AuthError(USER_AUTH_MESSAGES.USER_NOT_FOUND);
        }

        if (userData.isBlocked) {
            throw new AuthError(HTTP_MESSAGES.FORBIDDEN,HTTP_STATUS.FORBIDDEN);
        }
    } catch (error) {
        next(error);
    }
}
