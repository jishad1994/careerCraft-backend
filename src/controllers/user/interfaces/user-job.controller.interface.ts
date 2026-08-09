import { Request, Response, NextFunction } from "express";

export interface IUserJobController {
    searchJobs(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getJobById(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getJobBySlug(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    
    applyForJob(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
