import { Request, Response, NextFunction } from "express";
import { AccessPayload, verifyAccessToken } from "../utils/jwt.utils";
import { ApiResponse } from "../utils/apiResponse.utils";

export function userAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.accessToken;

    if (!token) return ApiResponse.unauthorized(res, "Unauthorized user");

    try {
        const payload: AccessPayload = verifyAccessToken(token);

        if (payload.role !== "user") {
            return ApiResponse.unauthorized(res, "Unauthorized");
        }
        req.user = { id: payload.sub, role: payload.role }; //converted to more meaningfull manner
        next();
    } catch (error) {
        return res
            .status(401)
            .json({ success: false, message: error instanceof Error ? error.message : "Invalid or expired token" });
    }
}
