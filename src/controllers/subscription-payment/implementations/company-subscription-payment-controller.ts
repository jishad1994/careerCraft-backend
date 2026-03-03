import { Request, Response, NextFunction } from "express";
import { ISubscriptionPaymentService } from "../../../services/subscription-payment-service/subscription-payment.service.interface";
import { ICompanySubscriptionPaymentController } from "../interfaces/company-subscription-payment-controller.interface";
import { AuthError } from "../../../errors-classes/auth.error";
import { ValidationError } from "../../../errors-classes/validation.error";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { COMPANY_SUBSCRIPTION_MESSAGES } from "../../../constants/messages/company-subscription.messages.constants";
import logger from "../../../utils/logger";
import { AppError } from "../../../errors-classes/app.error.";

export class CompanySubscriptionPaymentController implements ICompanySubscriptionPaymentController {
    constructor(private readonly _subscriptionPaymentService: ISubscriptionPaymentService) {}

    /**
     * Create payment intent and statrt subscription
     */
    async createPaymentIntentAndSubscribe(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const companyId = req.user?.id;
            if (!companyId) {
                throw new AuthError("Unauthorized access");
            }

            const { planId, isUpgrade } = req.body;

            if (!planId) {
                throw new ValidationError("No plan Id found");
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
                throw new AuthError("Unauthorized access");
            }

            const { subscriptionId, paymentIntentId } = req.body;

            if (!subscriptionId || !paymentIntentId) {
                throw new AppError("Subscription ID and Payment Intent ID are required");
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

    /**
     * Get payment status 
     */
    async getPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { intentId } = req.params;

            if (!intentId) {
                throw new AppError("Payment intent ID is required");
            }

            const status = await this._subscriptionPaymentService.getPaymentStatus(intentId);

            return ApiResponse.success(res, COMPANY_SUBSCRIPTION_MESSAGES.PAYMENT_STATUS_RETRIEVED, status);
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
