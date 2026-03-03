import { IPaymentService } from "./payment.service.interface";
import { IPaymentProvider } from "../payment-providers/payment.provider.interface";

export class PaymentService implements IPaymentService {
    constructor(private readonly provider: IPaymentProvider) {}

    async createPaymentIntent(
        amount: number,
        currency: string,
        metadata?: Record<string, string>,
    ): Promise<{ clientSecret: string; intentId: string }> {
        return await this.provider.createPaymentIntent(amount, currency, metadata);
    }

    async getPaymentStatus(paymentIntentId: string): Promise<string> {
        return await this.provider.getPaymentStatus(paymentIntentId);
    }
    verifyWebhookSignature(payload: string, signature: string, webhookSecret: string) {
        return this.provider.verifyWebhookSignature(payload, signature, webhookSecret);
    }

    getProviderInstance() {
        return this.provider.getProviderInstance();
    }
}
