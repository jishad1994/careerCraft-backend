import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import { AccessPayload, verifyAccessToken } from "../utils/jwt.utils";

export function companyAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(" ")[1];

    logger.info("token:", token);

    if (!token) {
        logger.error("unauthorized request expired request ");
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    try {
        const payload: AccessPayload = verifyAccessToken(token);

        if (payload.role !== "company") {
            logger.error("unauthorized request expired request ");
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        req.user = { id: payload.sub, role: payload.role };  //converted to more meaningfull manner

        next();
    } catch (error) {
        return res
            .status(401)
            .json({ success: false, message: error instanceof Error ? error.message : "Invalid or expired token" });
    }
}
