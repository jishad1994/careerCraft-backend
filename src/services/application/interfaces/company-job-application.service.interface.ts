import { IJobApplication, JobApplicationStatistics } from "../../../models/job-application/job-application.interface";
import { PaginationMeta } from "../../../utils/apiResponse.utils";

export interface ICompanyJobApplicationServiceInterface {
    getApplicationById(applicationId: string): Promise<IJobApplication>;
    getCompanyApplications(
        companyId: string,
        page: number,
        limit: number,
        filters?: { status?: string; jobId?: string }
    ): Promise<{ applications: IJobApplication[]; paginationMeta: PaginationMeta }>;
    getJobApplications(
        jobId: string,
        page: number,
        limit: number,
        status?: string
    ): Promise<{ applications: IJobApplication[]; paginationMeta: PaginationMeta }>;
    updateApplicationStatus(
        applicationId: string,
        status: string,
        changedBy?: string,
        notes?: string
    ): Promise<IJobApplication>;
    markApplicationAsViewed(applicationId: string, viewedBy: string): Promise<IJobApplication>;
    toggleStarApplication(applicationId: string): Promise<IJobApplication>;
    addNotes(applicationId: string, notes: string): Promise<IJobApplication>;
    getApplicationStatistics(companyId: string): Promise<JobApplicationStatistics>;
}
