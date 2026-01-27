// subscription.interface.ts
import mongoose, { Document } from "mongoose";

// export enum PlanName {
//     FREE = "free",
//     BASIC = "basic",
//     PREMIUM = "premium",
//     ENTERPRISE = "enterprise"
// }

export interface ISubscriptionLimits {
    jobs: number;
    resumeViews: number;
    featuredJobs: number;
}

export interface ISubscriptionFeatures {
    chat: boolean;
    videoCall: boolean;
    analytics: boolean;
}

export interface ISubscriptionPlan extends Document<mongoose.Types.ObjectId> {
    name: string;
    price: number;
    durationInDays: number;
    limits: ISubscriptionLimits;
    features: ISubscriptionFeatures;
    isActive: boolean;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}