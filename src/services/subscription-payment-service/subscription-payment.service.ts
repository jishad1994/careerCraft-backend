
import { ICompanySubscriptionRepository } from "../../repositories/company-subscription/company-subscription.repository.interface";
import { IPaymentRepository } from "../../repositories/payment/payment.repository.interfaces";
import { ISubscriptionPlanRepository } from "../../repositories/subscription-plan/subscription-plan.repository.interface";
import { IPaymentService } from "../../shared/services/payment-service/payment.service.interface";
import {
    ISubscriptionPaymentService,
    PaymentConfirmationResponse,
    PaymentIntentResponse,
} from "./subscription-payment.service.interface";
import {  Currency, PaymentMethod, PaymentStatus, PaymentType, } from "../../models/payments/payments.interface";
import { SubscriptionStatus } from "../../models/company-subscription/company-subscription.interface";
import { Types } from "mongoose";

export class SubscriptionPaymentService implements ISubscriptionPaymentService {
    constructor(
        private readonly _paymentService: IPaymentService,
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        private readonly _companySubscriptionRepository: ICompanySubscriptionRepository,
        private readonly _paymentRepository: IPaymentRepository,
    ) {}

    /**
     * Create Stripe payment intent and pending subscription
     */
    async createPaymentIntentAndSubscribe(companyId: string, planId: string, isUpgrade: boolean): Promise<PaymentIntentResponse> {
        // Get plan details
        const plan = await this._subscriptionPlanRepository.findById(planId);
        if (!plan) {
            throw new Error("Plan not found");
        }

        // Check for existing active subscription if not upgrade
        if (!isUpgrade) {
            const existing = await this._companySubscriptionRepository.findActiveByCompany(companyId);
            if (existing) {
                throw new Error("Company already has an active subscription");
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
    async confirmPaymentAndActivateSubscription(subscriptionId: string, paymentIntentId: string): Promise<PaymentConfirmationResponse> {
        const paymentStatus = await this._paymentService.getPaymentStatus(paymentIntentId);

        if (paymentStatus !== "succeeded") {
            throw new Error("Payment not successful");
        }

        const subscription = await this._companySubscriptionRepository.findById(subscriptionId);

        if (!subscription) {
            throw new Error("Subscription not found");
        }

        const payment = await this._paymentRepository.findPendingBySubscription(subscriptionId);

        if (!payment) {
            throw new Error("Payment not found");
        }

        await this._paymentRepository.updateStatus(payment._id.toString(), PaymentStatus.COMPLETED, {
            transactionId: paymentIntentId,

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

    // /**
    //  * Get Stripe instance (for advanced operations)
    //  */
    getPaymentProviderInstance() {
        return this._paymentService.getProviderInstance();
    }
}
