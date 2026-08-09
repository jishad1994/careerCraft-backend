import { NextFunction, Request, Response } from "express";

export interface ICompanyJobApplicationController {
    getApplicationById(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getCompanyApplications(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getApplicationsByJob(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    updateApplicationStatus(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    markAsViewed(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getStatistics(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getApplicantsList(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    toggleFlag(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    addNotes(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    rejectApplication(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getApplicationResume(req: Request, res: Response, next: NextFunction): Promise<void>;

    scheduleInterview(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    rescheduleInterview(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    cancelInterview(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    completeInterview(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    
    updateInterview(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getPopulatedInterviewById(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getUpcomingInterviews(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
