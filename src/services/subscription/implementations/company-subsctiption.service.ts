import { COMPANY_SUBSCRIPTION_MESSAGES } from "../../../constants/messages/company-subscription.messages.constants";
import { ValidationError } from "../../../errors-classes/validation.error";
import {
    ICompanySubscription,
    IQueuedSubscriptionDTO,
    SubscriptionStatus,
} from "../../../models/company-subscription/company-subscription.interface";
import { ISubscriptionAddonWithUsage } from "../../../models/subscription-add-on/addon.interface";
import { ICompanySubscriptionRepository } from "../../../repositories/company-subscription/company-subscription.repository.interface";
import { SubscriptionAddonRepository } from "../../../repositories/subscription-addon/subscription-addon.repository";
import { ICompanySubscriptionService } from "../interfaces/company-subscription.service.interface";

export class CompanySubscriptionService implements ICompanySubscriptionService {
    constructor(
        private readonly _companySubscriptionRepository: ICompanySubscriptionRepository,
        private readonly _addonRepository: SubscriptionAddonRepository,
    ) {}

    async getActiveSubscription(companyId: string): Promise<ICompanySubscription | null> {
        const activeSubscription = await this._companySubscriptionRepository.findActiveByCompany(companyId);
        console.log("active subscription:", activeSubscription);
        
        return activeSubscription;
    }

    async getRemainingLimits(
        companyId: string,
    ): Promise<{
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
            throw new ValidationError(COMPANY_SUBSCRIPTION_MESSAGES.EXISTING_PLAN_FOUND);
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

    async getSubscriptionQueue(
        companyId: string,
    ): Promise<{
        active: ICompanySubscription | null;
        queued: IQueuedSubscriptionDTO[];
    }> {
        const active = await this._companySubscriptionRepository.findActiveByCompany(companyId);
        const queued = await this._companySubscriptionRepository.findQueuedByCompany(companyId);

        return {
            active: active || null,

            queued: queued.map((sub) => ({
                ...sub,
                daysUntilStart: this.calculateDaysUntilStart(sub.scheduledStartDate),
            })),
        };
    }

    private calculateDaysUntilStart(scheduledDate?: Date): number {
        if (!scheduledDate) return 0;
        const now = new Date();
        const scheduled = new Date(scheduledDate);
        const diffMs = scheduled.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    /**
     * Get available addons for active subscription
     */
    async getAvailableAddons(companyId: string): Promise<ISubscriptionAddonWithUsage[]> {
        const activeSubscription = await this._companySubscriptionRepository.findActiveByCompany(companyId);
        if (!activeSubscription) {
            return [];
        }
        const allAddons = await this._addonRepository.findAllActive();
        return allAddons.map((addon) => ({
            ...addon.toObject(),
            currentLimit:
                activeSubscription.snapShot.limits[
                    addon.type === "jobs" ? "jobs" : addon.type === "resumeViews" ? "resumeViews" : "featuredJobs"
                ],
            currentAddonLimit: activeSubscription.addonLimits?.[addon.type] || 0,
            currentUsage:
                activeSubscription.usage[
                    addon.type === "jobs" ? "jobsPosted" : addon.type === "resumeViews" ? "resumesViewed" : "featuredUsed"
                ],
        }));
    }
}
