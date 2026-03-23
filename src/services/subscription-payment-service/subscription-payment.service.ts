import { ICompanySubscriptionRepository } from "../../repositories/company-subscription/company-subscription.repository.interface";
import { IPaymentRepository } from "../../repositories/payment/payment.repository.interfaces";
import { ISubscriptionPlanRepository } from "../../repositories/subscription-plan/subscription-plan.repository.interface";
import { IPaymentService } from "../../shared/services/payment-service/payment.service.interface";
import {
    ISubscriptionPaymentService,
    PaymentConfirmationResponse,
    PaymentIntentResponse,
} from "./subscription-payment.service.interface";
import { Currency, IPayment, PaymentMethod, PaymentStatus, PaymentType } from "../../models/payments/payments.interface";
import { SubscriptionStatus } from "../../models/company-subscription/company-subscription.interface";
import { Types } from "mongoose";
import { ValidationError } from "../../errors-classes/validation.error";
import { SUBSCRIPTION_PLAN_MESSAGES } from "../../constants/messages/admin.messages";
import { COMPANY_SUBSCRIPTION_MESSAGES } from "../../constants/messages/company-subscription.messages.constants";
import { IInvoiceService } from "../../shared/services/invoice-service/invoice.service.interface";
import { AppError } from "../../errors-classes/app.error.";
import { AuthError } from "../../errors-classes/auth.error";
import { HTTP_MESSAGES } from "../../constants/messages/http.messages.constants";

export class SubscriptionPaymentService implements ISubscriptionPaymentService {
    constructor(
        private readonly _paymentService: IPaymentService,
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        private readonly _companySubscriptionRepository: ICompanySubscriptionRepository,
        private readonly _paymentRepository: IPaymentRepository,
        private readonly _invoiceService: IInvoiceService,
    ) {}

    /**
     * Create Stripe payment intent and pending subscription
     */
    async createPaymentIntentAndSubscribe(
        companyId: string,
        planId: string,
        isUpgrade: boolean,
    ): Promise<PaymentIntentResponse> {
        const plan = await this._subscriptionPlanRepository.findById(planId);

        if (!plan) {
            throw new ValidationError(SUBSCRIPTION_PLAN_MESSAGES.PLAN_NOT_FOUND, 404);
        }

        // Check for existing active subscription if not upgrade

        if (!isUpgrade) {
            const existing = await this._companySubscriptionRepository.findActiveByCompany(companyId);
            if (existing) {
                throw new ValidationError(COMPANY_SUBSCRIPTION_MESSAGES.EXISTING_PLAN_FOUND);
            }
        }

        // Create Stripe payment intent with automatic payment methods
        const paymentIntent = await this._paymentService.createPaymentIntent(plan.price, "inr", {
            companyId,
            planId,
            isUpgrade: isUpgrade.toString(),
        });

        // Create pending payment record
        const payment = await this._paymentRepository.create({
            companyId: new Types.ObjectId(companyId),
            planId: new Types.ObjectId(planId),
            amount: plan.price,
            currency: Currency.INR,
            paymentMethod: PaymentMethod.STRIPE,
            paymentType: isUpgrade ? PaymentType.UPGRADE : PaymentType.SUBSCRIPTION,
            status: PaymentStatus.PENDING,
            transactionId: paymentIntent.intentId,
            description: `${isUpgrade ? "Upgrade to" : "Subscription to"} ${plan.name}`,
        });

        // Create pending subscription
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + plan.durationInDays);

        const subscription = await this._companySubscriptionRepository.create({
            companyId: new Types.ObjectId(companyId),
            planId: new Types.ObjectId(planId),
            paymentId: payment._id,
            status: SubscriptionStatus.PENDING,
            startDate,
            endDate,
            snapShot: {
                name: plan.name,
                price: plan.price,
                durationInDays: plan.durationInDays,
                limits: plan.limits,
                features: plan.features,
            },
            usage: {
                jobsPosted: 0,
                resumesViewed: 0,
                featuredUsed: 0,
            },
            autoRenew: false,
        });

        // Update payment with subscription ID
        await this._paymentRepository.updateStatus(payment._id.toString(), PaymentStatus.PENDING, {
            subscriptionId: subscription._id,
        });

        return {
            clientSecret: paymentIntent.clientSecret!,
            subscriptionId: subscription._id.toString(),
            intentId: paymentIntent.intentId,
        };
    }

    /**
     * Confirm Stripe payment and activate subscription
     */
    async confirmPaymentAndActivateSubscription(
        subscriptionId: string,
        paymentIntentId: string,
    ): Promise<PaymentConfirmationResponse> {
        const paymentStatus = await this._paymentService.getPaymentStatus(paymentIntentId);

        if (paymentStatus !== "succeeded") {
            throw new AppError("Payment not successful", 400);
        }

        const subscription = await this._companySubscriptionRepository.findById(subscriptionId);

        if (!subscription) {
            throw new ValidationError("Subscription not found", 404);
        }

        const payment = await this._paymentRepository.findPendingBySubscription(subscriptionId);

        if (!payment) {
            throw new ValidationError("Payment not found", 404);
        }

        const invoice = await this._invoiceService.generateInvoiceForSubscription(subscriptionId, payment._id.toString());

        await this._paymentRepository.updateStatus(payment._id.toString(), PaymentStatus.COMPLETED, {
            transactionId: paymentIntentId,
            invoiceNumber: invoice.invoiceNumber,
            gatewayResponse: {
                gatewayName: "stripe",
                transactionId: paymentIntentId,
                gatewayStatus: paymentStatus,
                gatewayMessage: "Payment successful",
                timestamp: new Date(),
            },
        });

        if (payment.paymentType === PaymentType.UPGRADE) {
            const oldSubscription = await this._companySubscriptionRepository.findActiveByCompany(
                subscription.companyId.toString(),
            );
            if (oldSubscription) {
                await this._companySubscriptionRepository.cancel(oldSubscription._id.toString(), "Upgraded to new plan");
            }
        }

        await this._companySubscriptionRepository.updateStatus(subscriptionId, SubscriptionStatus.ACTIVE);

        return {
            paymentId: payment._id.toString(),
            subscriptionId,
            status: "success",
            invoiceId: invoice._id.toString(),
            invoiceNumber: invoice.invoiceNumber,
        };
    }

    /**
     * Retry failed Stripe payment
     */
    async retryPayment(subscriptionId: string): Promise<PaymentIntentResponse> {
        const subscription = await this._companySubscriptionRepository.findById(subscriptionId);
        if (!subscription) {
            throw new Error("Subscription not found");
        }

        if (subscription.status !== SubscriptionStatus.PENDING) {
            throw new Error("Subscription is not pending");
        }

        // Get failed payment
        const payment = await this._paymentRepository.findPendingBySubscription(subscriptionId);
        if (!payment) {
            throw new Error("Payment not found");
        }

        const paymentIntent = await this._paymentService.createPaymentIntent(payment.amount, "inr", {
            companyId: payment.companyId.toString(),
            planId: payment.planId.toString(),
            subscriptionId,
            retry: "true",
        });

        // Update payment with new transaction ID
        await this._paymentRepository.updateStatus(payment._id.toString(), PaymentStatus.PENDING, {
            transactionId: paymentIntent.intentId,
        });

        return {
            clientSecret: paymentIntent.clientSecret,
            subscriptionId,
            intentId: paymentIntent.intentId,
        };
    }

    /**
     * Handle failed Stripe payment
     */
    async handleFailedPayment(subscriptionId: string, reason: string): Promise<void> {
        const payment = await this._paymentRepository.findPendingBySubscription(subscriptionId);
        if (payment) {
            await this._paymentRepository.updateStatus(payment._id.toString(), PaymentStatus.FAILED, {
                failureReason: reason,
            });
        }
    }

    /**
     * Get Stripe payment status
     */
    async getPaymentStatus(paymentIntentId: string): Promise<string> {
        return await this._paymentService.getPaymentStatus(paymentIntentId);
    }

    // /**
    //  * Verify Stripe webhook signature
    //  */
    async verifyWebhookSignature(payload: string, signature: string, webhookSecret: string) {
        return this._paymentService.verifyWebhookSignature(payload, signature, webhookSecret);
    }

    async getPaymentById(paymentId: string, companyId: string): Promise<IPayment | null> {
        console.log("paymentid:", paymentId);
        const payment = await this._paymentRepository.findById<IPayment>(paymentId);

        console.log("payment:", payment);
        if (!payment) {
            throw new ValidationError("Payment not found", 404);
        }

        if (payment.companyId.toString() !== companyId.toString()) {
            throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 403);
        }

        return payment;
    }

    // /**
    //  * Get Stripe instance (for advanced operations)
    //  */
    getPaymentProviderInstance() {
        return this._paymentService.getProviderInstance();
    }
}
