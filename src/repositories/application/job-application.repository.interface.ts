import { UpdateQuery } from "mongoose";
import {
    IInterview,
    IJobApplication,
    IJobApplicationDetails,
} from "../../models/job-application/job-application.interface";
import { IBaseRepository } from "../base-repository/base.repository.inteface";

export interface IJobApplicationRepository extends IBaseRepository<IJobApplication> {
    findApplicationDetailsById(applicationId: string): Promise<IJobApplicationDetails | null>;
    findByUserAndJob(userId: string, jobId: string): Promise<IJobApplication | null>;
    getApplicantsList(
        companyId: string,
        page: number,
        limit: number,
        search: string,
        filters: CandidatesFilters,
    ): Promise<[IJobApplicationDetails[], number]>;
    findByApplicant(
        applicantId: string,
        page: number,
        limit: number,
        status?: string,
    ): Promise<[IJobApplication[], number]>;
    findByCompany(
        companyId: string,
        page: number,
        limit: number,
        filters?: { status?: string; jobId?: string },
    ): Promise<[IJobApplication[], number]>;
    findByJob(jobId: string, page: number, limit: number, status?: string): Promise<[IJobApplication[], number]>;
    updateById(id: string, updates: UpdateQuery<IJobApplication>): Promise<IJobApplication | null>;
    getApplicationStats(companyId: string): Promise<Array<{ status: string; count: number }>>;

    addInterview(applicationId: string, interview: IInterview): Promise<IJobApplication | null>;
    updateInterview(
        applicationId: string,
        interviewId: string,
        round: number,
        updateData: Partial<IInterview>,
    ): Promise<IJobApplication | null>;
    removeInterview(applicationId: string, interviewId: string, round: number): Promise<IJobApplication | null>;
}

export interface CandidatesFilters {
    status?: string[];
    skills?: string[];
    experience?: string[];
    education?: string[];
    availability?: string[];
    dateRange?: string;
    startDate?: string;
    endDate?: string;
    jobId?: string;
}
