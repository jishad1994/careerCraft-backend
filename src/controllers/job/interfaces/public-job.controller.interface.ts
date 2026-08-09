import { Request, Response, NextFunction } from "express";

export interface IPublicJobController {
    getActiveJobs(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getFeaturedJobs(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    searchJobs(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getJobById(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getJobBySlug(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
