import { NextFunction, Request, Response } from "express";
import { ISubscriptionPlanServce } from "../../../services/subscription-plan/interfaces/subscription-plan.service.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { ICompanySubscriptionController } from "../interfaces/company-subscription.controller.interface";
import { COMPANY_SUBSCRIPTION_MESSAGES } from "../../../constants/messages/company-subscription.messages.constants";
import { AppError } from "../../../errors-classes/app.error.";
import { AuthError } from "../../../errors-classes/auth.error";
import { HTTP_MESSAGES, HTTP_STATUS } from "../../../constants/messages/http.messages.constants";
import { SUBSCRIPTION_PLAN_MESSAGES } from "../../../constants/messages/admin.messages";
import { ICompanySubscriptionService } from "../../../services/subscription/interfaces/company-subscription.service.interface";
import logger from "../../../utils/logger";
import { ValidationError } from "../../../errors-classes/validation.error";
import { ISubscriptionCancellationQueueService } from "../../../services/subscription/interfaces/subscritpion-cancellation.interface";

export class CompanySubscriptionController implements ICompanySubscriptionController {
    constructor(
        private readonly _companySubscriptionService: ICompanySubscriptionService,
        private readonly _subscriptionPlanService: ISubscriptionPlanServce,
        private readonly _subscriptioncCancellationService: ISubscriptionCancellationQueueService,
    ) {}

    /**
     * Get all active subscription plans
     * GET /api/subscriptions/plans
     */
    async getPlans(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const plans = await this._subscriptionPlanService.getActivePlans();

            return ApiResponse.success(res, COMPANY_SUBSCRIPTION_MESSAGES.PLANS_FETCH_SUCCESSFULL, plans);
        } catch (error) {
            next(error);
        }
    }

    async getPlanById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const companyId = req.user?.id;
            if (!companyId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);
            }

            const planId = req.params.planId;
            console.log("planId:", planId);
            if (!planId || typeof planId !== "string") {
                throw new ValidationError("Invalid planId");
            }

            const plan = await this._subscriptionPlanService.getPlanById(planId);
            console.log("plan", plan);
            logger.info("plan:", plan);

            return ApiResponse.success(res, SUBSCRIPTION_PLAN_MESSAGES.FETCH_SUCCESSFULL_BY_ID, plan);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get active subscription for logged-in company
     * GET /api/subscriptions/active
     */
    async getActiveSubscription(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const companyId = req.user?.id;

            if (!companyId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);
            }

            const subscription = await this._companySubscriptionService.getActiveSubscription(companyId);

            if (!subscription) {
                throw new AppError(COMPANY_SUBSCRIPTION_MESSAGES.NO_ACTIVE_SUBSCRIPTION_FOUND, HTTP_STATUS.NOT_FOUND);
            }

            return ApiResponse.success(
                res,
                COMPANY_SUBSCRIPTION_MESSAGES.ACTIVE_SUBSCRIPTION_FETCH_SUCCESSFULL,
                subscription,
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get remaining limits
     * GET /api/subscriptions/remaining-limits
     */
    async getRemainingLimits(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const companyId = req.user?.id;
            if (!companyId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);
            }

            const limits = await this._companySubscriptionService.getRemainingLimits(companyId);

            if (!limits) {
                throw new AppError("No active subscription found");
            }

            return ApiResponse.success(res, COMPANY_SUBSCRIPTION_MESSAGES.REMAINING_LIMITS_FETCH_SUCCESSFULL, limits);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Cancel subscription
     * POST /api/subscriptions/cancel
     */
    async cancelSubscription(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const companyId = req.user?.id;

            if (!companyId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);
            }
            const { reason } = req.body;

            const result = await this._subscriptioncCancellationService.cancelSubscriptionWithQueueManagement(companyId, {
                reason,
            });

            return ApiResponse.success(res, result.message, result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Upgrade subscription (initiates payment for upgrade)
     * POST /api/subscriptions/upgrade
     */
    async upgradeSubscription(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const companyId = req.user?.id;
            if (!companyId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);
            }

            const { planId } = req.body;
            if (!planId) {
                throw new AppError("No plan found");
            }

            // Check if company has active subscription
            const activeSubscription = await this._companySubscriptionService.getActiveSubscription(companyId);
            if (!activeSubscription) {
                throw new AppError("No active subscription found to upgrade");
            }

            // Get new plan
            const plan = await this._subscriptionPlanService.getPlanById(planId);
            if (!plan) {
                throw new ValidationError("No plan found", 404);
            }

            // TODO: Create payment intent/session for upgrade
            const paymentUrl = `${process.env.FRONTEND_URL}/payment/upgrade?planId=${planId}`;

            return ApiResponse.success(res, COMPANY_SUBSCRIPTION_MESSAGES.UPGRADE_PAYMENT_INITIATED, { paymentUrl });
        } catch (error) {
            next(error);
        }
    }

    async getAvailableAddons(req: Request, res: Response, next: NextFunction) {
        try {
            const companyId = req.user?.id;
            if (!companyId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);
            }

            const addons = await this._companySubscriptionService.getAvailableAddons(companyId);

            return ApiResponse.success(res, COMPANY_SUBSCRIPTION_MESSAGES.ADDON_FETCH_SUCCESSFULL, addons);
        } catch (error) {
            next(error);
        }
    }
    async getSubscriptionQueue(req: Request, res: Response, next: NextFunction) {
        try {
            const companyId = req.user?.id;
            if (!companyId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);
            }

            const { active, queued } = await this._companySubscriptionService.getSubscriptionQueue(companyId);

            return ApiResponse.success(res, COMPANY_SUBSCRIPTION_MESSAGES.SUBSCRIPTION_QUEUE_FETCH_SUCCESSFULL, {
                active,
                queued,
            });
        } catch (error) {
            next(error);
        }
    }
}
