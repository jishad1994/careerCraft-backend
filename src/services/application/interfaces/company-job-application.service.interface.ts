import { GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { IJobApplication, JobApplicationStatistics } from "../../../models/job-application/job-application.interface";
import { CandidatesFilters } from "../../../repositories/application/job-application.repository.interface";
import { PaginationMeta } from "../../../utils/apiResponse.utils";

export interface ICompanyJobApplicationServiceInterface {
    getApplicationById(applicationId: string): Promise<IJobApplication>;
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
    ): Promise<IJobApplication>;
    markApplicationAsViewed(applicationId: string, viewedBy: string): Promise<IJobApplication>;
    getApplicantsList(
        companyId: string,
        page: number,
        limit: number,
        search: string,
        filters: CandidatesFilters,
    ): Promise<{ applications: IJobApplication[]; paginationMeta: PaginationMeta }>;

    toggleStarApplication(applicationId: string, isStarred: boolean): Promise<IJobApplication>;
    addNotes(applicationId: string, notes: string): Promise<IJobApplication>;
    getApplicationStatistics(companyId: string): Promise<JobApplicationStatistics>;

    getApplicationResume(applicationId: string,companyId:string): Promise<GetObjectCommandOutput>;
}
