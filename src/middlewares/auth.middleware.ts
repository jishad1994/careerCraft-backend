import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.utils";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("auth token", token);
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    } catch (error) {
        return res
            .status(401)
            .json({ success: false, message: error instanceof Error ? error.message : "Invalid or expired token" });
    }
}
