import { Request, Response, NextFunction } from "express";

export interface ISubscriptionPlanController {
    createPlan(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getAllPlans(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getActivePlans(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getPlanById(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    updatePlan(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    deletePlan(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    togglePlanStatus(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getPlansByPriceRange(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    updatePlanLimits(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    updatePlanFeatures(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
