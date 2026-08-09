import { RequestHandler } from "express";

export interface IAuthController {
    refresh: RequestHandler;
    google: RequestHandler;
    login: RequestHandler;
    signup: RequestHandler;
    logout: RequestHandler;
    checkUserPhoneOrEmailExists: RequestHandler;
    requestOTP: RequestHandler;
    resendOTP: RequestHandler;
    verifyOTP: RequestHandler;
    forgotPassword: RequestHandler;
    resetPassword: RequestHandler;
}