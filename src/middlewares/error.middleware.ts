import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error.";
import logger from "../utils/logger";

export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction) {
    if (err.isOperational) {
        logger.error(err.message);
        return res.status(err.statusCode).json({ success: false, message: err.message });
    } else {
        logger.error(err.message);
        res.status(500).json({ success: false, message: "internal server error" });
    }
}

export default errorHandler;
