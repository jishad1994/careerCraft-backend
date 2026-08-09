import { IJobApplication, IJobApplicationDetails } from "../../../models/job-application/job-application.interface";
import { PaginationMeta } from "../../../utils/apiResponse.utils";

export interface IUserJobApplicationService {
    getApplicationStatus(
        userId: string,
        jobId: string
    ): Promise<{ appliedStatus: boolean; applicationStatus: string | null }>;
    getUserApplications(
        userId: string,
        page: number,
        limit: number,
        status?: string
    ): Promise<{ applications: IJobApplication[]; paginationMeta: PaginationMeta }>;
    getApplicationById(applicationId: string): Promise<IJobApplicationDetails>;

    checkApplicationStatus(jobId: string, userId: string): Promise<{ hasApplied: boolean; application?: IJobApplication }>;
    withdrawApplication(applicationId: string, userId: string): Promise<IJobApplication>;
    updateApplicationStatus(
        applicationId: string,
        status: string,
        changedBy?: string,
        notes?: string
    ): Promise<IJobApplication>;
}
