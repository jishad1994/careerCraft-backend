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
import { IAddon, SubscriptionStatus } from "../../models/company-subscription/company-subscription.interface";
import { Types } from "mongoose";
import { ValidationError } from "../../errors-classes/validation.error";
import { SUBSCRIPTION_PLAN_MESSAGES } from "../../constants/messages/admin.messages";
import { IInvoiceService } from "../../shared/services/invoice-service/invoice.service.interface";
import { AppError } from "../../errors-classes/app.error.";
import { AuthError } from "../../errors-classes/auth.error";
import { HTTP_MESSAGES } from "../../constants/messages/http.messages.constants";
import { SubscriptionAddonRepository } from "../../repositories/subscription-addon/subscription-addon.repository";

export class SubscriptionPaymentService implements ISubscriptionPaymentService {
    constructor(
        private readonly _paymentService: IPaymentService,
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        private readonly _companySubscriptionRepository: ICompanySubscriptionRepository,
        private readonly _paymentRepository: IPaymentRepository,
        private readonly _invoiceService: IInvoiceService,
        private readonly _addonRepository:SubscriptionAddonRepository
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

        const activeSubscription = await this._companySubscriptionRepository.findActiveByCompany(companyId);

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
        let startDate: Date;
        let endDate: Date;
        let isQueued = false;
        let queuePosition = 0;
        let scheduledStartDate: Date | undefined;
        if (activeSubscription) {
            // QUEUE THE NEW SUBSCRIPTION
            // Get existing queued subscriptions
            const queuedSubs = await this._companySubscriptionRepository.findQueuedByCompany(companyId);
            queuePosition = queuedSubs.length + 1;

            // Find the last subscription in queue (or active if no queue)
            const lastSub = queuedSubs.length > 0 ? queuedSubs[queuedSubs.length - 1] : activeSubscription;

            // Schedule to start after the last subscription ends
            scheduledStartDate = new Date(lastSub.endDate);
            scheduledStartDate.setSeconds(scheduledStartDate.getSeconds() + 1);

            startDate = scheduledStartDate;
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + plan.durationInDays);

            isQueued = true;
        } else {
            startDate = new Date();
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + plan.durationInDays);
        }

        // Create subscription
        const subscription = await this._companySubscriptionRepository.create({
            companyId: new Types.ObjectId(companyId),
            planId: new Types.ObjectId(planId),
            paymentId: payment._id,
            status: isQueued ? SubscriptionStatus.QUEUED : SubscriptionStatus.PENDING,
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
            isQueued,
            queuePosition,
            scheduledStartDate,
            previousSubscriptionId: activeSubscription?._id,
            addonLimits: {
                jobs: 0,
                resumeViews: 0,
                featuredJobs: 0,
            },
        });

        // Update payment with subscription ID
        await this._paymentRepository.updateStatus(payment._id.toString(), PaymentStatus.PENDING, {
            subscriptionId: subscription._id,
        });

        return {
            clientSecret: paymentIntent.clientSecret!,
            subscriptionId: subscription._id.toString(),
            intentId: paymentIntent.intentId,
            isQueued,
            queuePosition: isQueued ? queuePosition : undefined,
            scheduledStartDate: scheduledStartDate?.toISOString(),
        };
    }

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

        // Generate invoice
        const invoice = await this._invoiceService.generateInvoiceForSubscription(subscriptionId, payment._id.toString());

        // Update payment status
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

        // If subscription is queued, keep it queued
        // If not queued, activate immediately
        const newStatus = subscription.isQueued ? SubscriptionStatus.QUEUED : SubscriptionStatus.ACTIVE;

        await this._companySubscriptionRepository.updateStatus(subscriptionId, newStatus);

        console.log(
            subscription.isQueued
                ? `Subscription ${subscriptionId} queued at position ${subscription.queuePosition}`
                : `Subscription ${subscriptionId} activated immediately`,
        );

        return {
            paymentId: payment._id.toString(),
            subscriptionId,
            status: "success",
            invoiceId: invoice._id.toString(),
            invoiceNumber: invoice.invoiceNumber,
            isQueued: subscription.isQueued,
            queuePosition: subscription.queuePosition,
            scheduledStartDate: subscription.scheduledStartDate?.toISOString(),
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
            isQueued: subscription.isQueued,
        };
    }

    
    async purchaseAddon(companyId: string, addonId: string): Promise<PaymentIntentResponse> {

        console.log('inside purchae addon')
        const activeSubscription = await this._companySubscriptionRepository.findActiveByCompany(companyId);

        if (!activeSubscription) {
            throw new ValidationError("No active subscription found. Please subscribe to a plan first.", 404);
        }

        console.log('Active subscription found:', activeSubscription);

        const addon = await this._addonRepository.findById(addonId);

        if (!addon) {
            throw new ValidationError("Addon not found", 404);
        }

        if (!addon.isActive) {
            throw new ValidationError("This addon is no longer available", 400);
        }

        const paymentIntent = await this._paymentService.createPaymentIntent(addon.price, "inr", {
            companyId,
            addonId,
            subscriptionId: activeSubscription._id.toString(),
            type: PaymentType.ADDON,
        });

        console.log('payment intert:',paymentIntent);

        const payment = await this._paymentRepository.create({
            companyId: new Types.ObjectId(companyId),
            planId: activeSubscription.planId,
            amount: addon.price,
            addonId: new Types.ObjectId(addonId),
            currency: Currency.INR,
            paymentMethod: PaymentMethod.STRIPE,
            paymentType: PaymentType.ADDON,
            status: PaymentStatus.PENDING,
            transactionId: paymentIntent.intentId,
            description: `Addon: ${addon.name}`,
            subscriptionId: activeSubscription._id,
        });

        console.log('payment record created:',payment); 

        return {
            clientSecret: paymentIntent.clientSecret!,
            subscriptionId: activeSubscription._id.toString(),
            intentId: paymentIntent.intentId,
            paymentId: payment._id.toString(),
            addonId: addon._id.toString(),
        };
    }

    /**
     * NEW: Confirm addon purchase
     */
    async confirmAddonPurchase(paymentId: string, paymentIntentId: string): Promise<PaymentConfirmationResponse> {
        const paymentStatus = await this._paymentService.getPaymentStatus(paymentIntentId);

        if (paymentStatus !== "succeeded") {
            throw new AppError("Payment not successful", 400);
        }

        const payment = await this._paymentRepository.findById(paymentId);

        if (!payment) {
            throw new ValidationError("Payment not found", 404);
        }

        if (payment.paymentType !== PaymentType.ADDON) {
            throw new ValidationError("Invalid payment type", 400);
        }

        // Get subscription
        const subscription = await this._companySubscriptionRepository.findById(payment.subscriptionId.toString());

        if (!subscription) {
            throw new ValidationError("Subscription not found", 404);
        }

        // Get addon from payment metadata
        const addonId = payment.addonId?.toString();

        if (!addonId) {
            throw new ValidationError("Addon information not found in payment", 400);
        }

        const addon = await this._addonRepository.findById(addonId);

        if (!addon) {
            throw new ValidationError("Addon not found", 404);
        }

        const addonToAdd: IAddon = {
            addonId: addon._id,
            name: addon.name,
            type: addon.type,
            quantity: addon.quantity,
            price: addon.price,
            paymentId: payment._id,
        };

        // Add addon to subscription
        await this._companySubscriptionRepository.addAddon(subscription._id.toString(), addonToAdd);

        // Update payment status
        await this._paymentRepository.updateStatus(payment._id.toString(), PaymentStatus.COMPLETED, {
            transactionId: paymentIntentId,
            gatewayResponse: {
                gatewayName: "stripe",
                transactionId: paymentIntentId,
                gatewayStatus: paymentStatus,
                gatewayMessage: "Addon purchase successful",
                timestamp: new Date(),
            },
        });

        console.log(`Addon ${addon.name} added to subscription ${subscription._id}: +${addon.quantity} ${addon.type}`);

        return {
            paymentId: payment._id.toString(),
            subscriptionId: subscription._id.toString(),
            status: "success",
            addonName: addon.name,
            addonQuantity: addon.quantity,
            addonType: addon.type,
        };
    }

    /**
     * Process subscription queue - Activate queued subscriptions
     */
    async processSubscriptionQueue(): Promise<{
        expired: number;
        activated: number;
    }> {
        let expiredCount = 0;
        let activatedCount = 0;

        // 1. Find and expire active subscriptions
        const expiredSubscriptions = await this._companySubscriptionRepository.findExpired();

        for (const subscription of expiredSubscriptions) {
            await this._companySubscriptionRepository.updateStatus(subscription._id.toString(), SubscriptionStatus.EXPIRED);
            expiredCount++;

            console.log(`Expired subscription ${subscription._id} for company ${subscription.companyId}`);

            // 2. Check if there's a queued subscription to activate
            const queuedSubs = await this._companySubscriptionRepository.findQueuedByCompany(
                subscription.companyId.toString(),
            );

            if (queuedSubs.length > 0) {
                const nextToActivate = queuedSubs[0]; // Position 1

                // Activate it
                await this._companySubscriptionRepository.updateOneByFilter(
                    { _id: nextToActivate._id },
                    {
                        status: SubscriptionStatus.ACTIVE,
                        isQueued: false,
                        activatedAt: new Date(),
                    },
                );

                // Reorder remaining queued subscriptions
                for (let i = 1; i < queuedSubs.length; i++) {
                    await this._companySubscriptionRepository.updateOneByFilter(
                        { _id: queuedSubs[i]._id },
                        {
                            queuePosition: i,
                        },
                    );
                }

                activatedCount++;
                console.log(`Activated queued subscription ${nextToActivate._id} for company ${subscription.companyId}`);
            }
        }

        // 3. Also check for queued subscriptions that should start now
        const readyToActivate = await this._companySubscriptionRepository.findReadyToActivate();

        for (const subscription of readyToActivate) {
            // Double-check there's no active subscription
            const active = await this._companySubscriptionRepository.findActiveByCompany(subscription.companyId.toString());

            if (!active) {
                await this._companySubscriptionRepository.updateOneByFilter(
                    { _id: subscription._id },
                    {
                        status: SubscriptionStatus.ACTIVE,
                        isQueued: false,
                        activatedAt: new Date(),
                    },
                );

                activatedCount++;
                console.log(`Activated scheduled subscription ${subscription._id} for company ${subscription.companyId}`);
            }
        }

        return {
            expired: expiredCount,
            activated: activatedCount,
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
