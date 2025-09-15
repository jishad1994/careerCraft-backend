import { Response, Request, NextFunction } from "express";

export function requiredRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user?.role)) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        next();
    };
}
