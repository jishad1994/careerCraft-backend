import { NextFunction, Request, Response } from "express";

export interface IUserProfileController {
    getUserProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    updateUserProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    addUserSkills(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
