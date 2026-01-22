import { IJobApplication } from "../../../models/job-application/job-application.interface";
import { IJob } from "../../../models/job/job.interface";
import { PaginationMeta } from "../../../utils/apiResponse.utils";

export interface IAdminJobService {
    getAllJobs(
        page: number,
        limit: number,
        filters?: Partial<IJob>
    ): Promise<{ jobs: IJob[]; paginationMeta: PaginationMeta }>;
    getJobById(jobId: string): Promise<IJob>;
    getApplicationsByJob(jobId: string, page: number, limit: number): Promise<[IJobApplication[], PaginationMeta]>;
    verifyJob(jobId: string): Promise<IJob>;
    blockJob(jobId: string): Promise<IJob>;
    unblockJob(jobId: string): Promise<IJob>;
    deleteJob(jobId: string): Promise<boolean>;
}
