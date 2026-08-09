import { Model, PipelineStage } from "mongoose";
import { IUser } from "../../models/user/user.interface";
import { ICompany } from "../../models/company/company.interface";
import { IJob } from "../../models/job/job.interface";
import { IJobApplication } from "../../models/job-application/job-application.interface";
import { IPayment } from "../../models/payments/payments.interface";
import { ICompanySubscription } from "../../models/company-subscription/company-subscription.interface";

import { IAdminStatsRepository } from "./admin-stats.repository.interface";
import { MonthlyGrowthPoint } from "../../dtos/admin-stats.dto";

export class AdminStatsRepository implements IAdminStatsRepository {
    constructor(
        private readonly _userModel: Model<IUser>,
        private readonly _companyModel: Model<ICompany>,
        private readonly _jobModel: Model<IJob>,
        private readonly _applicationModel: Model<IJobApplication>,
        private readonly _paymentModel: Model<IPayment>,
        private readonly _subscriptionModel: Model<ICompanySubscription>,
    ) {}

    private buildMonthlyGrowthPipeline(): PipelineStage[] {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        return [
            { $match: { createdAt: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ];
    }

    private formatMonthlyGrowth(
        raw: Array<{ _id: { year: number; month: number }; count: number }>,
    ): MonthlyGrowthPoint[] {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return raw.map((item) => ({
            month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
            count: item.count,
        }));
    }

    async getUserStats(): Promise<{
        total: number;
        blocked: number;
        monthlyGrowth: MonthlyGrowthPoint[];
    }> {
        const [total, blocked, growthRaw] = await Promise.all([
            this._userModel.countDocuments({ role: "user" }),
            this._userModel.countDocuments({ role: "user", isBlocked: true }),
            this._userModel.aggregate<{ _id: { year: number; month: number }; count: number }>([
                { $match: { role: "user" } },
                ...this.buildMonthlyGrowthPipeline(),
            ]),
        ]);

        return { total, blocked, monthlyGrowth: this.formatMonthlyGrowth(growthRaw) };
    }

    async getCompanyStats(): Promise<{
        total: number;
        verified: number;
        blocked: number;
        monthlyGrowth: MonthlyGrowthPoint[];
    }> {
        const [total, verified, blocked, growthRaw] = await Promise.all([
            this._companyModel.countDocuments({ role: "company" }),
            this._companyModel.countDocuments({ role: "company", verificationStatus: "verified" }),
            this._companyModel.countDocuments({ role: "company", isBlocked: true }),
            this._companyModel.aggregate<{ _id: { year: number; month: number }; count: number }>([
                { $match: { role: "company" } },
                ...this.buildMonthlyGrowthPipeline(),
            ]),
        ]);

        return { total, verified, blocked, monthlyGrowth: this.formatMonthlyGrowth(growthRaw) };
    }

    async getJobStats(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        verified: number;
    }> {
        const [total, verified, statusRaw] = await Promise.all([
            this._jobModel.countDocuments(),
            this._jobModel.countDocuments({ isVerified: true }),
            this._jobModel.aggregate<{ _id: string; count: number }>([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
        ]);

        const byStatus: Record<string, number> = {
            active: 0, draft: 0, paused: 0, closed: 0, expired: 0,
        };

        statusRaw.forEach((item) => {
            if (item._id in byStatus) byStatus[item._id] = item.count;
        });

        return { total, verified, byStatus };
    }

    async getApplicationStats(): Promise<{
        total: number;
        byStatus: Record<string, number>;
    }> {
        const [total, statusRaw] = await Promise.all([
            this._applicationModel.countDocuments(),
            this._applicationModel.aggregate<{ _id: string; count: number }>([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
        ]);

        const byStatus: Record<string, number> = {
            pending: 0, reviewing: 0, shortlisted: 0, rejected: 0, hired: 0,
        };

        statusRaw.forEach((item) => {
            if (item._id in byStatus) byStatus[item._id] = item.count;
        });

        return { total, byStatus };
    }

    async getRevenueStats(): Promise<{
        total: number;
        monthlyGrowth: MonthlyGrowthPoint[];
    }> {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        const [totalRaw, growthRaw] = await Promise.all([
            this._paymentModel.aggregate<{ total: number }>([
                { $match: { status: "completed" } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
            this._paymentModel.aggregate<{ _id: { year: number; month: number }; count: number }>([
                { $match: { status: "completed", createdAt: { $gte: twelveMonthsAgo } } },
                {
                    $group: {
                        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                        count: { $sum: "$amount" },
                    },
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
            ]),
        ]);

        return {
            total: totalRaw[0]?.total ?? 0,
            monthlyGrowth: this.formatMonthlyGrowth(growthRaw),
        };
    }

    async getSubscriptionStats(): Promise<{
        active: number;
        cancelled: number;
        expired: number;
    }> {
        const statusRaw = await this._subscriptionModel.aggregate<{ _id: string; count: number }>([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        const stats = { active: 0, cancelled: 0, expired: 0 };
        statusRaw.forEach((item) => {
            if (item._id === "active") stats.active = item.count;
            if (item._id === "cancelled") stats.cancelled = item.count;
            if (item._id === "expired") stats.expired = item.count;
        });

        return stats;
    }
}