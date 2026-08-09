import { IJob } from "../../../models/job/job.interface";
import { JobSearchFilters } from "../../../repositories/job/job.repository.interface";
import { PaginationMeta } from "../../../utils/apiResponse.utils";

export interface ICompanyJobService {
    createJob(companyId: string, jobData: Partial<IJob>): Promise<IJob>;
    getCompanyJobs(
        companyId: string,
        page: number,
        limit: number,
       filters:JobSearchFilters
    ): Promise<{ jobs: IJob[]; paginationMeta: PaginationMeta }>;
    getJobById(companyId: string, jobId: string): Promise<IJob>;
    updateJob(companyId: string, jobId: string, updates: Partial<IJob>): Promise<IJob>;
    updateJobStatus(companyId: string, jobId: string, status: string): Promise<IJob>;
    deleteJob(companyId: string, jobId: string): Promise<boolean>;
}
