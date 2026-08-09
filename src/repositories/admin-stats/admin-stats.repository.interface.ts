import { MonthlyGrowthPoint } from "../../dtos/admin-stats.dto";


export interface IAdminStatsRepository {
    getUserStats(): Promise<{
        total: number;
        blocked: number;
        monthlyGrowth: MonthlyGrowthPoint[];
    }>;
    getCompanyStats(): Promise<{
        total: number;
        verified: number;
        blocked: number;
        monthlyGrowth: MonthlyGrowthPoint[];
    }>;
    getJobStats(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        verified: number;
    }>;
    getApplicationStats(): Promise<{
        total: number;
        byStatus: Record<string, number>;
    }>;
    getRevenueStats(): Promise<{
        total: number;
        monthlyGrowth: MonthlyGrowthPoint[];
    }>;
    getSubscriptionStats(): Promise<{
        active: number;
        cancelled: number;
        expired: number;
    }>;
}