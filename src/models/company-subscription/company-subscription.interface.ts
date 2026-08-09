// company-subscription.interface.ts
import mongoose, { Document, Types } from "mongoose";

export enum SubscriptionStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    CANCELLED = "cancelled",
    PENDING = "pending",
    SUSPENDED = "suspended",
    QUEUED = "queued",
}

export type companySubscriptionUsageTypes = "jobsPosted" | "resumesViewed" | "featuredUsed";

export type AddonType = "jobs" | "resumeViews" | "featuredJobs";

export interface IAddon {
    _id?: Types.ObjectId;

    addonId: Types.ObjectId;
    name: string;

    type: AddonType;

    quantity: number;
    price: number;

    purchasedAt?: Date;

    paymentId?: Types.ObjectId;

    createdAt?: Date;
    updatedAt?: Date;
}

export interface ISubscriptionUsage {
    jobsPosted: number;
    resumesViewed: number;
    featuredUsed: number;
    lastResetAt?: Date;
}

export interface ISubscriptionSnapshot {
    name: string;
    price: number;
    durationInDays: number;
    limits: {
        jobs: number;
        resumeViews: number;
        featuredJobs: number;
    };
    features: {
        chat: boolean;
        videoCall: boolean;
        analytics: boolean;
    };
}

export interface ICompanySubscription extends Document<mongoose.Types.ObjectId> {
    companyId: mongoose.Types.ObjectId;
    planId: mongoose.Types.ObjectId;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    usage: ISubscriptionUsage;
    paymentId: mongoose.Types.ObjectId;
    cancelledAt?: Date;
    cancelReason?: string;
    snapShot: ISubscriptionSnapshot;
    autoRenew: boolean;

    isQueued: boolean;
    queuePosition: number;
    queuedAt: Date;
    scheduledStartDate: Date;
    activatedAt: Date;

    addons: IAddon[];
    addonLimits: {
        jobs: number;
        resumeViews: number;
        featuredJobs: number;
    };

    previousSubscriptionId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;

    // Instance methods
    isActive(): boolean;
    hasExpired(): boolean;
    canUseFeature(feature: keyof ISubscriptionSnapshot["features"]): boolean;
    getRemainingLimits(): {
        jobs: number;
        resumeViews: number;
        featuredJobs: number;
    };
    incrementUsage(type: keyof ISubscriptionUsage): Promise<void>;
}


export interface IQueuedSubscriptionDTO {
    companyId: mongoose.Types.ObjectId;
    planId: mongoose.Types.ObjectId;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    usage: ISubscriptionUsage;
    paymentId: mongoose.Types.ObjectId;
    cancelledAt?: Date;
    cancelReason?: string;
    snapShot: ISubscriptionSnapshot;
    autoRenew: boolean;

    isQueued: boolean;
    queuePosition: number;
    queuedAt: Date;
    scheduledStartDate: Date;
    activatedAt: Date;

    addons: IAddon[];
    addonLimits: {
        jobs: number;
        resumeViews: number;
        featuredJobs: number;
    };

    previousSubscriptionId?: mongoose.Types.ObjectId;
    daysUntilStart: number;
}
