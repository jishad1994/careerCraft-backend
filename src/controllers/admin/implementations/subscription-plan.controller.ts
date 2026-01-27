// controllers/subscription-plan.controller.ts
import { Request, Response, NextFunction } from "express";
import { ISubscriptionPlanServce } from "../../../services/subscription-plan/interfaces/subscription-plan.service.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { SUBSCRIPTION_PLAN_MESSAGES } from "../../../constants/messages/admin.messages";

export class SubscriptionPlanController {
    constructor(private _subscriptionPlanService: ISubscriptionPlanServce) {}

    async createPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const plan = await this._subscriptionPlanService.createPlan(req.body);

            return ApiResponse.success(res, SUBSCRIPTION_PLAN_MESSAGES.CREATED, plan);
        } catch (error) {

            next(error);
        }
    }

    async getAllPlans(req: Request, res: Response, next: NextFunction) {
        try {
            const plans = await this._subscriptionPlanService.getAllPlans();
            return ApiResponse.success(res, SUBSCRIPTION_PLAN_MESSAGES.FETCH_SUCCESSFULL, plans);
        } catch (error) {
            next(error);
        }
    }

    async getActivePlans(req: Request, res: Response, next: NextFunction) {
        try {
            const plans = await this._subscriptionPlanService.getActivePlans();
            return ApiResponse.success(res, SUBSCRIPTION_PLAN_MESSAGES.FETCH_SUCCESSFULL, plans);
        } catch (error) {
            next(error);
        }
    }

    async getPlanById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const plan = await this._subscriptionPlanService.getPlanById(id);
            return ApiResponse.success(res, SUBSCRIPTION_PLAN_MESSAGES.FETCH_SUCCESSFULL_BY_ID, plan);
        } catch (error) {
            next(error);
        }
    }

    async updatePlan(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const plan = await this._subscriptionPlanService.updatePlan(id, req.body);
            return ApiResponse.success(res, SUBSCRIPTION_PLAN_MESSAGES.UPDATED, plan);
        } catch (error) {
            next(error);
        }
    }

    async deletePlan(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await this._subscriptionPlanService.deletePlan(id);
            return ApiResponse.success(res, SUBSCRIPTION_PLAN_MESSAGES.DELETED);
        } catch (error) {
            next(error);
        }
    }

    async togglePlanStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const plan = await this._subscriptionPlanService.togglePlanStatus(id);
            return ApiResponse.success(res, SUBSCRIPTION_PLAN_MESSAGES.TOGGLE_STATUS, plan);
        } catch (error) {
            next(error);
        }
    }

    async getPlansByPriceRange(req: Request, res: Response, next: NextFunction) {
        try {
            const { minPrice, maxPrice } = req.query;
            const plans = await this._subscriptionPlanService.getPlansByPriceRange(Number(minPrice), Number(maxPrice));
            return ApiResponse.success(res, SUBSCRIPTION_PLAN_MESSAGES.FETCH_SUCCESSFULL, plans);
        } catch (error) {
            next(error);
        }
    }

    async updatePlanLimits(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const plan = await this._subscriptionPlanService.updatePlanLimits(id, req.body);
            return ApiResponse.success(res, SUBSCRIPTION_PLAN_MESSAGES.UPDATED, plan);
        } catch (error) {
            next(error);
        }
    }

    async updatePlanFeatures(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const plan = await this._subscriptionPlanService.updatePlanFeatures(id, req.body);
            return ApiResponse.success(res, SUBSCRIPTION_PLAN_MESSAGES.UPDATED, plan);
        } catch (error) {
            next(error);
        }
    }
}
