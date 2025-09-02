import { Request, Response } from "express";

export interface IAuthController {
    signup(req: Request, res: Response): Promise<Response | void>;

    checkUserPhoneOrEmailExists(req: Request, res: Response): Promise<Response | void>;

    requestOTP(req: Request, res: Response): Promise<Response | void>;

    resendOTP(req: Request, res: Response): Promise<Response | void>;

    verifyOTP(req: Request, res: Response): Promise<Response | void>;

    requestForgotPasswordOtp(req: Request, res: Response): Promise<Response | void>;

    verifyForgotPasswordOtp(req: Request, res: Response): Promise<Response | void>;

    resetPassword(req: Request, res: Response): Promise<Response | void>;
}
