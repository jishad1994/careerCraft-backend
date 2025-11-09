import { Request, Response, NextFunction } from "express";
import { AccessPayload, verifyAccessToken } from "../utils/jwt.utils";
import logger from "../utils/logger";

export function userAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    // const token = req.headers.authorization?.split(" ")[1];
    const token = req.cookies.accessToken;
    logger.info("auth token", token);

    console.log("token", token);
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    try {
        const payload: AccessPayload = verifyAccessToken(token);

        if (payload.role !== "user") {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        req.user = { id: payload.sub, role: payload.role }; //converted to more meaningfull manner
        next();
    } catch (error) {
        return res
            .status(401)
            .json({ success: false, message: error instanceof Error ? error.message : "Invalid or expired token" });
    }
}
