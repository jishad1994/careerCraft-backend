import { NextFunction, Request, Response } from "express";
import { AuthError } from "../errors-classes/auth.error";
import { HTTP_MESSAGES } from "../constants/messages/http.messages.constants";
import { companyRepo, userRepo } from "../dependencies/container.dependency";

export async function checkAccountBlockedMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const authUser = req.user;

        if (!authUser?.id || !authUser.role) {
            return next(new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401));
        }

        if (authUser.role === "user") {

            const user = await userRepo.findById(authUser.id);

            if (!user) {
                return next(new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401));
            }

            if (user.isBlocked) {
                return next(new AuthError("Your account has been blocked by admin", 403));
            }

            return next();
        }

        if (authUser.role === "company") {
            const company = await companyRepo.findById(authUser.id);

            if (!company) {
                return next(new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401));
            }

            if (company.isBlocked) {
                return next(new AuthError("Your company account has been blocked by admin", 403));
            }

            return next();
        }

        return next(new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401));
    } catch (error) {
        next(error);
    }
}
