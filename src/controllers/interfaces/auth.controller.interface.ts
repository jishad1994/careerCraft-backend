import { Request, Response } from "express";

export interface IAuthController {
    login(req: Request, res: Response): Promise<Response | void>;

    signup(req: Request, res: Response): Promise<Response | void>;

    logout(req: Request, res: Response): Promise<Response | void>;

    checkUserPhoneOrEmailExists(req: Request, res: Response): Promise<Response | void>;

    requestOTP(req: Request, res: Response): Promise<Response | void>;

    resendOTP(req: Request, res: Response): Promise<Response | void>;

    verifyOTP(req: Request, res: Response): Promise<Response | void>;

    forgotPassword(req: Request, res: Response): Promise<Response | void>;

    resetPassword(req: Request, res: Response): Promise<Response | void>;

    google(req: Request, res: Response): Promise<Response | void>;
}
