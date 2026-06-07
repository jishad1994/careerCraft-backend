import { Request, Response, NextFunction } from "express";

export interface IAdminStatsController {
    /**
     * Express route handler to fetch and return admin panel dashboard statistics.
     * @param req Express Request object
     * @param res Express Response object
     * @param next Express NextFunction for error handling
     */
    getStats(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}