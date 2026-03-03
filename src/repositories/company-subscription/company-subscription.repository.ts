import { Model, Types } from "mongoose";
import { companySubscriptionUsageTypes, ICompanySubscription, SubscriptionStatus,  } from "../../models/company-subscription/company-subscription.interface";
import { BaseRepository } from "../base-repository/base.repository";
import { ICompanySubscriptionRepository } from "./company-subscription.repository.interface";

export class CompanySubscriptionRepository
    extends BaseRepository<ICompanySubscription>
    implements ICompanySubscriptionRepository
{

    constructor(model: Model<ICompanySubscription>) {
        super(model);
    }


    async findActiveByCompany(companyId: string): Promise<ICompanySubscription | null> {
        return await this.model
            .findOne({
                companyId: new Types.ObjectId(companyId),
                status: SubscriptionStatus.ACTIVE,
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() },
            })
            .lean();
    }

    async findByCompany(companyId: string): Promise<ICompanySubscription[]> {
        return await this.model
            .find({ companyId: new Types.ObjectId(companyId) })
            .sort({ createdAt: -1 })
            .lean();
    }

    async findExpired(): Promise<ICompanySubscription[]> {
        return await this.model
            .find({
                status: SubscriptionStatus.ACTIVE,
                endDate: { $lt: new Date() },
            })
            .lean();
    }

    async create(data: Partial<ICompanySubscription>): Promise<ICompanySubscription> {
        const subscription = new this.model(data);
        return await subscription.save();
    }

    async updateStatus(id: string, status: SubscriptionStatus): Promise<ICompanySubscription | null> {
        return await this.model.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).lean();
    }

    async cancel(id: string, reason: string): Promise<ICompanySubscription | null> {
        return await this.model
            .findByIdAndUpdate(
                id,
                {
                    status: SubscriptionStatus.CANCELLED,
                    cancelledAt: new Date(),
                    cancelReason: reason,
                },
                { new: true, runValidators: true },
            )
            .lean();
    }

    async incrementUsage(
        id: string,
        type: companySubscriptionUsageTypes,
    ): Promise<ICompanySubscription | null> {
        const subscription = await this.model.findById(id);
        if (!subscription) return null;

        const limitMap = {
            jobsPosted: "jobs",
            resumesViewed: "resumeViews",
            featuredUsed: "featuredJobs",
        } as const;

        const limitKey = limitMap[type];
        const currentUsage = subscription.usage[type];
        const limit = subscription.snapShot.limits[limitKey];

        if (currentUsage >= limit) {
            throw new Error(`${type} limit exceeded`);
        }

        subscription.usage[type] = currentUsage + 1;
        return await subscription.save();
    }
}
