import { NextFunction, Request, Response } from "express";

export interface ICompanyProfileController {
    getProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
