import { Request, Response, NextFunction } from "express";

export interface ICompanySubscriptionPaymentController {
    createPaymentIntentAndSubscribe(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    confirmPaymentAndActivateSubscription(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    retryPayment(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getPaymentById(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    
    handleWebhook(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
