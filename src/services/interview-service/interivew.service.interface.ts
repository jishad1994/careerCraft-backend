import { IInterview } from "../../models/job-application/job-application.interface";
import { PaginationMeta } from "../../utils/apiResponse.utils";

export interface IInterviewService {
    scheduleInterview(applicationId: string, interviewData: Partial<IInterview>, scheduledBy: string): Promise<IInterview>;

    rescheduleInterview(
        applicationId: string,
        interviewId: string,
        round: number,
        newScheduledAt: Date,
        reason?: string,
    ): Promise<IInterview>;

    cancelInterview(applicationId: string, interviewId: string, round: number, reason?: string): Promise<IInterview>;

    updateInterview(
        applicationId: string,
        interviewId: string,
        round: number,
        updateData: Partial<IInterview>,
    ): Promise<IInterview>;

    completeInterview(
        applicationId: string,
        interviewId: string,
        round: number,
        feedback?: string,
        rating?: number,
    ): Promise<IInterview>;

    getInterviewsbyApplication(
        applicationId: string,
        page: number,
        limit: number,
    ): Promise<{ interviews: IInterview[]; paginationMeta: PaginationMeta }>;

    getInterviewsbyJob(
        jobId: string,
        page: number,
        limit: number,
    ): Promise<{ interviews: IInterview[]; paginationMeta: PaginationMeta }>;
    // getAllInterviews(companyId: string): Promise<IInterview[]>;
}
