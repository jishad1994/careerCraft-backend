import { Request, Response, NextFunction } from "express";

export interface ICompanyJobController {
    createJob(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getCompanyJobs(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getJobById(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    updateJob(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    updateJobStatus(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    deleteJob(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
