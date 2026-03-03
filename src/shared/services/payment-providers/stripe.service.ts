import Stripe from "stripe";
import { IPaymentProvider } from "./payment.provider.interface";
export class StripeService implements IPaymentProvider {
    private readonly stripe: Stripe;

    constructor(private readonly stripeSecretKey: string) {
        this.stripe = new Stripe(this.stripeSecretKey, { apiVersion: "2026-01-28.clover" });
    }

    async createPaymentIntent(
        amount: number,
        currency: string,
        metadata?: Record<string, string>,
    ): Promise<{ clientSecret: string; intentId: string }> {
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency,
            metadata,
            automatic_payment_methods: {
                enabled: true, // Enables Cards, Wallets, BNPL, Bank transfers, etc.
            },
        });

        return { clientSecret: paymentIntent.client_secret!, intentId: paymentIntent.id };
    }

    async getPaymentStatus(paymentIntentId: string): Promise<string> {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent.status;
    }

    verifyWebhookSignature(payload: string, signature: string, webhookSecret: string): Stripe.Event {
        return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    }
    getProviderInstance(): Stripe {
        return this.stripe;
    }
}
