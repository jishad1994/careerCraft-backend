import { Request, Response, NextFunction } from "express";

export interface IPublicJobController {
    getActiveJobs(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getFeaturedJobs(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
