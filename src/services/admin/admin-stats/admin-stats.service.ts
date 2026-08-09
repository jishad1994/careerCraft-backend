import { AdminStatsDto } from "../../../dtos/admin-stats.dto";
import { IAdminStatsRepository } from "../../../repositories/admin-stats/admin-stats.repository.interface";
import { IAdminStatsService } from "./admin-stats.service.interface";

export class AdminStatsService implements IAdminStatsService {
    constructor(private readonly _statsRepository: IAdminStatsRepository) {}

    async getStats(): Promise<AdminStatsDto> {
        const [users, companies, jobs, applications, revenue, subscriptions] = await Promise.all([
            this._statsRepository.getUserStats(),
            this._statsRepository.getCompanyStats(),
            this._statsRepository.getJobStats(),
            this._statsRepository.getApplicationStats(),
            this._statsRepository.getRevenueStats(),
            this._statsRepository.getSubscriptionStats(),
        ]);

        return {
            users,
            companies,
            jobs: {
                total: jobs.total,
                verified: jobs.verified,
                byStatus: {
                    active: jobs.byStatus["active"],
                    draft: jobs.byStatus["draft"],
                    paused: jobs.byStatus["paused"],
                    closed: jobs.byStatus["closed"],
                    expired: jobs.byStatus["expired"],
                },
            },
            applications: {
                total: applications.total,
                byStatus: {
                    pending: applications.byStatus["pending"],
                    reviewing: applications.byStatus["reviewing"],
                    shortlisted: applications.byStatus["shortlisted"],
                    interviewed: applications.byStatus["interviewed"],
                    rejected: applications.byStatus["rejected"],
                    hired: applications.byStatus["hired"],
                },
            },
            revenue,
            subscriptions,
        };
    }
}
