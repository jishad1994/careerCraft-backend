import { NextFunction, Request, Response } from "express";

export interface IUserProfileController {
    getProfile(req: Request, res: Response,next:NextFunction): Promise<Response | void>;
}
