import { ICompanySubscription, IQueuedSubscriptionDTO } from "../../../models/company-subscription/company-subscription.interface";
import { ISubscriptionAddonWithUsage } from "../../../models/subscription-add-on/addon.interface";

export interface ICompanySubscriptionService {
    getActiveSubscription(companyId: string): Promise<ICompanySubscription | null>;

    getRemainingLimits(
        companyId: string,
    ): Promise<{
        jobs: number;
        resumeViews: number;
        featuredJobs: number;
    } | null>;

    cancelSubscription(companyId: string, reason: string): Promise<ICompanySubscription>;

    canUseFeature(companyId: string, feature: "chat" | "videoCall" | "analytics"): Promise<boolean>;

    incrementUsage(companyId: string, type: "jobsPosted" | "resumesViewed" | "featuredUsed"): Promise<void>;

    processExpiredSubscriptions(): Promise<number>;

    getSubscriptionQueue(
        companyId: string,
    ): Promise<{
        active: ICompanySubscription | null;
        queued: IQueuedSubscriptionDTO[];
    }>;


    getAvailableAddons(companyId: string): Promise<ISubscriptionAddonWithUsage[]>
}
