import {
    ICompanySubscription,
    SubscriptionStatus,
} from "../../../models/company-subscription/company-subscription.interface";
import { ICompanySubscriptionRepository } from "../../../repositories/company-subscription/company-subscription.repository.interface";
import { ICompanySubscriptionService } from "../interfaces/company-subscription.service.interface";

export class CompanySubscriptionService implements ICompanySubscriptionService {
    constructor(private readonly _companySubscriptionRepository: ICompanySubscriptionRepository) {}

    async getActiveSubscription(companyId: string): Promise<ICompanySubscription | null> {
        return await this._companySubscriptionRepository.findActiveByCompany(companyId);
    }

    async getRemainingLimits(companyId: string): Promise<{
        jobs: number;
        resumeViews: number;
        featuredJobs: number;
    } | null> {
        const subscription = await this.getActiveSubscription(companyId);
        if (!subscription) return null;

        return {
            jobs: Math.max(0, subscription.snapShot.limits.jobs - subscription.usage.jobsPosted),
            resumeViews: Math.max(0, subscription.snapShot.limits.resumeViews - subscription.usage.resumesViewed),
            featuredJobs: Math.max(0, subscription.snapShot.limits.featuredJobs - subscription.usage.featuredUsed),
        };
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(companyId: string, reason: string): Promise<ICompanySubscription> {
        const subscription = await this.getActiveSubscription(companyId);
        if (!subscription) {
            throw new Error("No active subscription found");
        }

        const cancelled = await this._companySubscriptionRepository.cancel(subscription._id.toString(), reason);

        if (!cancelled) {
            throw new Error("Failed to cancel subscription");
        }

        return cancelled;
    }

    /**
     * Check if company can use feature
     */
    async canUseFeature(companyId: string, feature: "chat" | "videoCall" | "analytics"): Promise<boolean> {
        const subscription = await this.getActiveSubscription(companyId);
        if (!subscription) return false;

        return subscription.snapShot.features[feature] === true;
    }

    /**
     * Increment usage
     */
    async incrementUsage(companyId: string, type: "jobsPosted" | "resumesViewed" | "featuredUsed"): Promise<void> {
        const subscription = await this.getActiveSubscription(companyId);
        if (!subscription) {
            throw new Error("No active subscription found");
        }

        await this._companySubscriptionRepository.incrementUsage(subscription._id.toString(), type);
    }

    /**
     * Check and update expired subscriptions
     */
    async processExpiredSubscriptions(): Promise<number> {
        const expired = await this._companySubscriptionRepository.findExpired();
        let count = 0;

        for (const subscription of expired) {
            await this._companySubscriptionRepository.updateStatus(subscription._id.toString(), SubscriptionStatus.EXPIRED);
            count++;
        }

        return count;
    }
}
