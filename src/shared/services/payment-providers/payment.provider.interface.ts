// payment-provider.interface.ts

export interface IPaymentProvider {
    createPaymentIntent(
        amount: number,
        currency: string,
        metadata?: Record<string, string>,
    ): Promise<{
        clientSecret: string;
        intentId: string;
    }>;

    getPaymentStatus(paymentIntentId: string): Promise<string>;

    verifyWebhookSignature(payload: string, signature: string, webhookSecret: string): unknown;

    getProviderInstance(): unknown;
}
