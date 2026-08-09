import { IJobApplication } from "../../../models/job-application/job-application.interface";
import { IJob } from "../../../models/job/job.interface";
import { JobSearchFilters } from "../../../repositories/job/job.repository.interface";
import { PaginationMeta } from "../../../utils/apiResponse.utils";

export interface IUserJobService {
    searchJobs(
        filters: JobSearchFilters,
        page: number,
        limit: number
    ): Promise<{ jobs: IJob[]; paginationMeta: PaginationMeta }>;
    getJobById(jobId: string): Promise<IJob>;
    getJobBySlug(slug: string): Promise<IJob>;
    applyForJob(userId:string,applicationData:IJobApplication): Promise<IJobApplication>;
    saveCoverLetter(file: Express.Multer.File, userId: string): Promise<{key:string,signedUrl:string}>;
}
