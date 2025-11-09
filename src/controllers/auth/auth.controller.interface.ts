import { NextFunction, Request, Response } from "express";

export interface IAuthController {
    refresh(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    google(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    login(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    signup(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    logout(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    checkUserPhoneOrEmailExists(req: Request, res: Response): Promise<Response | void>;

    requestOTP(req: Request, res: Response): Promise<Response | void>;

    resendOTP(req: Request, res: Response): Promise<Response | void>;

    verifyOTP(req: Request, res: Response): Promise<Response | void>;

    forgotPassword(req: Request, res: Response): Promise<Response | void>;

    resetPassword(req: Request, res: Response): Promise<Response | void>;
}
