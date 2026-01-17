import { NextFunction, Request, Response } from "express";

export interface ICompanyJobApplicationController {
    getApplicationById(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getCompanyApplications(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getJobApplications(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    updateApplicationStatus(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    markAsViewed(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    addNotes(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getStatistics(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
