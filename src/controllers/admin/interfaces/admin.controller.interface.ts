import { NextFunction, Request, Response } from "express";

export interface IAdminController {
    getCompanies(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    blockUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    blockCompany(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    unblockUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    unblockCompany(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
