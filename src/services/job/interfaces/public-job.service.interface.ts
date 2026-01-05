import { IJob } from "../../../models/job/job.interface";
import { JobSearchFilters } from "../../../repositories/job/job.repository.interface";
import { PaginationMeta } from "../../../utils/apiResponse.utils";

export interface IPublicJobService {
    getActiveJobs(
        page: number,
        limit: number,
        filters?: JobSearchFilters
    ): Promise<{ jobs: IJob[]; paginationMeta: PaginationMeta }>;
    
    getFeaturedJobs(page:number,limit: number): Promise<{jobs:IJob[],paginationMeta:PaginationMeta}>;
}
