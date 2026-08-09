import { IPayment } from "../../models/payments/payments.interface";

export interface ISubscriptionPaymentService {
    createPaymentIntentAndSubscribe(companyId: string, planId: string, isUpgrade: boolean): Promise<PaymentIntentResponse>;

    confirmPaymentAndActivateSubscription(
        subscriptionId: string,
        paymentIntentId: string,
    ): Promise<PaymentConfirmationResponse>;

    retryPayment(subscriptionId: string): Promise<PaymentIntentResponse>;

    handleFailedPayment(subscriptionId: string, reason: string): Promise<void>;

    getPaymentStatus(paymentIntentId: string): Promise<string>;

    getPaymentById(paymentId: string, companyId: string): Promise<IPayment | null>;

    processSubscriptionQueue(): Promise<{
        expired: number;
        activated: number;
    }>;

    purchaseAddon(companyId: string, addonId: string): Promise<PaymentIntentResponse>;

    confirmAddonPurchase(paymentId: string, paymentIntentId: string): Promise<PaymentConfirmationResponse>;
}

export interface PaymentIntentResponse {
    clientSecret: string;
    subscriptionId: string;
    intentId: string;
    isQueued?: boolean;
    queuePosition?: number;
    paymentId?: string;
    scheduledStartDate?: string;
    addonId?: string;
}

export interface PaymentConfirmationResponse {
    paymentId: string;
    subscriptionId: string;
    invoiceId?: string;
    invoiceNumber?: string;
    status: string;
    isQueued?: boolean;
    queuePosition?: number;
    scheduledStartDate?: string;
    addonName?: string;
    addonQuantity?: number;
    addonType?: string;
}
