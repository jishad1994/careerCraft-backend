import { Request, Response } from "express";

export interface IAdminController {
    getUsersPaginated(req: Request, res: Response): Promise<Response | void>;
    getCompaniesPaginated(req: Request, res: Response): Promise<Response | void>;
    getCompanies(req: Request, res: Response): Promise<Response | void>;
    getUsers(req: Request, res: Response): Promise<Response | void>;
}
