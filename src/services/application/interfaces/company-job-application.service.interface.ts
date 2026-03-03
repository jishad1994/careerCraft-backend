import { GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { IJobApplication, IJobApplicationDetails, JobApplicationStatistics } from "../../../models/job-application/job-application.interface";
import { CandidatesFilters } from "../../../repositories/application/job-application.repository.interface";
import { PaginationMeta } from "../../../utils/apiResponse.utils";

export interface ICompanyJobApplicationServiceInterface {
    getApplicationDetailsById(applicationId: string): Promise<IJobApplicationDetails>;
    getCompanyApplications(
        companyId: string,
        page: number,
        limit: number,
        filters?: { status?: string; jobId?: string },
    ): Promise<{ applications: IJobApplication[]; paginationMeta: PaginationMeta }>;
    getJobApplications(
        jobId: string,
        page: number,
        limit: number,
        status?: string,
    ): Promise<{ applications: IJobApplication[]; paginationMeta: PaginationMeta }>;
    updateApplicationStatus(
        applicationId: string,
        status: string,
        changedBy?: string,
        notes?: string,
    ): Promise<IJobApplicationDetails>;
    markApplicationAsViewed(applicationId: string, viewedBy: string): Promise<IJobApplicationDetails>;
    getApplicantsList(
        companyId: string,
        page: number,
        limit: number,
        search: string,
        filters: CandidatesFilters,
    ): Promise<{ applications: IJobApplicationDetails[]; paginationMeta: PaginationMeta }>;

    toggleStarApplication(applicationId: string, isStarred: boolean): Promise<IJobApplicationDetails>;
    addNotes(applicationId: string, notes: string): Promise<IJobApplicationDetails>;
    getApplicationStatistics(companyId: string): Promise<JobApplicationStatistics>;

    getApplicationResume(applicationId: string,companyId:string): Promise<GetObjectCommandOutput>;
}
