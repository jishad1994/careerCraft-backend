import logger from "../utils/logger";
import { NextFunction, Request, Response } from "express";

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    logger.info(`Incoming request: ${req.method}${req.url}`);

    res.on("finish", () => {
        const duration = Date.now() - start;
        const message = `${req.method} ${req.originalUrl} ${req.statusCode} - ${duration}ms`;
        if (res.statusCode >= 500) {
            logger.error(message);
        } else if (res.statusCode >= 400) {
            logger.warn(message);
        } else {
            logger.info(message);
        }
    });
    next();
};

export default requestLogger;
