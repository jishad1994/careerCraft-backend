import { InterviewFilter, InterviewWithPopulated } from "../../interfaces/interview.interface";
import { IInterview } from "../../models/job-application/job-application.interface";
import { PaginationMeta } from "../../utils/apiResponse.utils";

export interface IInterviewService {
    getPopulatedInterviewById(interviewId: string): Promise<InterviewWithPopulated>;

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
       
        updateData: Partial<IInterview>,
    ): Promise<IInterview>;

    completeInterview(
        applicationId: string,
        interviewId: string,
        round: number,
        feedback?: string,
        rating?: number,
    ): Promise<IInterview>;

    getInterviews(
        filter: InterviewFilter,
        page?: number,
        limit?: number,
    ): Promise<{ interviews: InterviewWithPopulated[]; paginationMeta: PaginationMeta }>;

    getInterviewStats(filter: Partial<InterviewFilter>): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
        upcoming: number;
        past: number;
    }>;

    getUpcomingInterviews(
        filter: Partial<InterviewFilter>,
        days?: number,
        page?: number,
        limit?: number,
    ): Promise<{ interviews: InterviewWithPopulated[]; paginationMeta: PaginationMeta }>;
}
