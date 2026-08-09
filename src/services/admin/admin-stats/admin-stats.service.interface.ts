import { AdminStatsDto } from "../../../dtos/admin-stats.dto";

export interface IAdminStatsService {
    /**
     * Fetches and compiles comprehensive dashboard statistics for the admin panel.
     * @returns A promise resolving to the compiled AdminStatsDto.
     */
    getStats(): Promise<AdminStatsDto>;
}