import { Request, Response, NextFunction } from "express";

export interface IAdminJobController {
    getAllJobs(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    verifyJob(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    blockJob(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    unblockJob(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    deleteJob(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
