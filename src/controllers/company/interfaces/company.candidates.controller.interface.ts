import { Response, Request, NextFunction } from "express";

export interface ICompanyCandidatesController {
    getCandidateProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getCandidateResumeStream(req: Request, res: Response, next: NextFunction): Promise<void>;
}
