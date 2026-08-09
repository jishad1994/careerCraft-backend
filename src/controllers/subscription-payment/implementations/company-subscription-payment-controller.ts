import { Request, Response, NextFunction } from "express";
import { ISubscriptionPaymentService } from "../../../services/subscription-payment-service/subscription-payment.service.interface";
import { ICompanySubscriptionPaymentController } from "../interfaces/company-subscription-payment-controller.interface";
import { AuthError } from "../../../errors-classes/auth.error";
import { ValidationError } from "../../../errors-classes/validation.error";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { COMPANY_SUBSCRIPTION_MESSAGES } from "../../../constants/messages/company-subscription.messages.constants";
import logger from "../../../utils/logger";
import { AppError } from "../../../errors-classes/app.error.";
import { HTTP_MESSAGES } from "../../../constants/messages/http.messages.constants";
import { SUBSCRIPTION_PLAN_MESSAGES } from "../../../constants/messages/admin.messages";
import { PAYMENT_MESSAGES } from "../../../constants/messages/payment.messages.constants";

export class CompanySubscriptionPaymentController implements ICompanySubscriptionPaymentController {
    constructor(private readonly _subscriptionPaymentService: ISubscriptionPaymentService) {}

    /**
     * Create payment intent and statrt subscription
     */
    async createPaymentIntentAndSubscribe(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const companyId = req.user?.id;
            if (!companyId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401);
            }

            const { planId, isUpgrade } = req.body;

            if (!planId) {
                throw new ValidationError(SUBSCRIPTION_PLAN_MESSAGES.PLAN_NOT_FOUND);
            }

            const paymentIntentResponse = await this._subscriptionPaymentService.createPaymentIntentAndSubscribe(
                companyId,
                planId,
                isUpgrade || false,
            );

            return ApiResponse.success(res, COMPANY_SUBSCRIPTION_MESSAGES.PAYMENT_INITIATED, paymentIntentResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Confirm payment
     */
    async confirmPaymentAndActivateSubscription(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const companyId = req.user?.id;
            if (!companyId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);
            }

            const { subscriptionId, paymentIntentId } = req.body;

            if (!subscriptionId) {
                throw new ValidationError(COMPANY_SUBSCRIPTION_MESSAGES.SUBSCRIPTION_ID_NOT_FOUND);
            }

            if (!paymentIntentId) {
                throw new ValidationError(PAYMENT_MESSAGES.PAYMENT_INTENT_ID_NOT_FOUND);
            }

            const result = await this._subscriptionPaymentService.confirmPaymentAndActivateSubscription(
                subscriptionId,
                paymentIntentId,
            );

            return ApiResponse.success(res, COMPANY_SUBSCRIPTION_MESSAGES.PAYMENT_CONFIRMED, result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Retry failed payment
     */
    async retryPayment(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const companyId = req.user?.id;
            if (!companyId) {
                throw new AuthError("Unauthorized access");
            }

            const { subscriptionId } = req.body;

            if (!subscriptionId) {
                throw new AppError("No subscription id found");
            }

            const result = await this._subscriptionPaymentService.retryPayment(subscriptionId);

            return ApiResponse.success(res, COMPANY_SUBSCRIPTION_MESSAGES.PAYMENT_REINITIATED, result);
        } catch (error) {
            next(error);
        }
    }

    async purchaseAddon(req: Request, res: Response, next: NextFunction) {
        try {
            const companyId = req.user?.id;

            if (!companyId) {
                throw new AuthError("Unauthorized access");
            }

            const { addonId } = req.params;

            if (!addonId || typeof addonId !== "string") {
                throw new ValidationError("Invalid addonId");
            }

            const paymentIntentResponse = await this._subscriptionPaymentService.purchaseAddon(companyId, addonId);

            return ApiResponse.success(res, COMPANY_SUBSCRIPTION_MESSAGES.ADDON_PURCHASE_INITIATED, paymentIntentResponse);
        } catch (error) {
            next(error);
        }
    }

    async confirmAddon(req: Request, res: Response, next: NextFunction) {
        try {
            const { paymentId, paymentIntentId } = req.body;

            const result = await this._subscriptionPaymentService.confirmAddonPurchase(paymentId, paymentIntentId);
            return ApiResponse.success(res, COMPANY_SUBSCRIPTION_MESSAGES.ADDON_PURCHASE_PAYMENT_CONFIRMED, result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get payment status
     */
    async getPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { intentId } = req.params;

            if (!intentId || typeof intentId !== "string") {
                throw new ValidationError("Invalid intentId");
            }

            const status = await this._subscriptionPaymentService.getPaymentStatus(intentId);

            return ApiResponse.success(res, COMPANY_SUBSCRIPTION_MESSAGES.PAYMENT_STATUS_RETRIEVED, status);
        } catch (error) {
            next(error);
        }
    }

    async getPaymentById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const companyId = req.user?.id;

            if (!companyId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401);
            }
            const { paymentId } = req.params;

            if (!paymentId || typeof paymentId !== "string") {
                throw new ValidationError("Invalid paymentId");
            }

            const payment = await this._subscriptionPaymentService.getPaymentById(paymentId, companyId);

            return ApiResponse.success(res, COMPANY_SUBSCRIPTION_MESSAGES.PAYMENT_FETCH_SUCCESSFULL, payment);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Stripe webhook handler
     */
    async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const sig = req.headers["stripe-signature"];

            if (!sig) {
                return res.status(400).send("Missing stripe signature");
            }

            // Webhook handling logic here
            // const body = req.body;

            // body.event;

            // switch (event.type) {
            //     case "payment_intent.succeeded":
            //         logger.info("Payment succeeded:", event.data.object.id);
            //         break;

            //     case "payment_intent.payment_failed":
            //         console.log("Payment failed:", event.data.object.id);
            //         await this._subscriptionPaymentService.handleFailedPayment(
            //             event.data.object.metadata.subscriptionId,
            //             "Payment failed",
            //         );
            //         break;

            //     default:
            //         console.log(`Unhandled event type: ${event.type}`);
            // }

            return res.json({ received: true });
        } catch (error) {
            logger.error("Webhook error:", error);
            next(error);
        }
    }
}
