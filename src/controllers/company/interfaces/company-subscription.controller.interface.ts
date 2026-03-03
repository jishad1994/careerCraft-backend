import { NextFunction, Request, Response } from "express";

export interface ICompanySubscriptionController {
    getPlans(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getActiveSubscription(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getRemainingLimits(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    cancelSubscription(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    upgradeSubscription(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
