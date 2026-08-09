import { NextFunction, Request, Response } from "express";

export interface IUserJobApplicationController {
    checkApplicationStatus(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getApplicationById(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getUserApplications(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    withdrawApplication(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getAllInterviews(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getPopulatedInterviewById(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getInterviewStats(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
