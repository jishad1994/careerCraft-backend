export interface MonthlyGrowthPoint {
    month: string;
    count: number;
}

export interface AdminStatsDto {
    users: {
        total: number;
        blocked: number;
        monthlyGrowth: MonthlyGrowthPoint[];
    };
    companies: {
        total: number;
        verified: number;
        blocked: number;
        monthlyGrowth: MonthlyGrowthPoint[];
    };
    jobs: {
        total: number;
        byStatus: {
            active: number;
            draft: number;
            paused: number;
            closed: number;
            expired: number;
        };
        verified: number;
    };
    applications: {
        total: number;
        byStatus: {
            pending: number;
            reviewing: number;
            shortlisted: number;
            interviewed: number;
            rejected: number;
            hired: number;
        };
    };
    revenue: {
        total: number;
        monthlyGrowth: MonthlyGrowthPoint[];
    };
    subscriptions: {
        active: number;
        cancelled: number;
        
        expired: number;
    };
}