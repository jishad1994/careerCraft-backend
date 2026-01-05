import { IJob } from "../../../models/job/job.interface";
import { IJobRepository, JobSearchFilters } from "../../../repositories/job/job.repository.interface";
import { PaginationMeta } from "../../../utils/apiResponse.utils";
import { IPublicJobService } from "../interfaces/public-job.service.interface";

export class PublicJobService implements IPublicJobService {
    constructor(private _jobRepository: IJobRepository) {}

    async getActiveJobs(
        page: number,
        limit: number,
        filters?: JobSearchFilters
    ): Promise<{ jobs: IJob[]; paginationMeta: PaginationMeta }> {
        const searchFilters: JobSearchFilters = {
            ...filters,
            status: "active",
            isVerified: true,
        };

        const [jobs, total] = await this._jobRepository.search(searchFilters, page, limit);

        const totalPages = Math.ceil(total / limit);
        const paginationMeta: PaginationMeta = {
            page,
            limit,
            totalPages,
            totalItems: total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };

        return { jobs, paginationMeta };
    }

    async getFeaturedJobs(page: number = 1, limit: number): Promise<{ jobs: IJob[]; paginationMeta: PaginationMeta }> {
        const [jobs, total] = await this._jobRepository.findAllJobs(page, limit, {
            status: "active",
            isVerified: true,
            isFeatured: true,
        });

        const totalPages = Math.ceil(total / limit);

        const paginationMeta: PaginationMeta = {
            page,
            limit,
            totalPages,
            totalItems: total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };

        return { jobs, paginationMeta };
    }
}
