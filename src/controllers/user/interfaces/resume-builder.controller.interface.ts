import { Request, Response, NextFunction } from "express";

export interface IResumeBuilderController {
    
    getTemplates(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getDraft(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    saveDraft(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getProfileData(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    generatePdf(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    uploadResume(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
