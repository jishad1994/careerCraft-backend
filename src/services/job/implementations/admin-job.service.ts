import { FilterQuery } from "mongoose";
import { IJob } from "../../../models/job/job.interface";
import { IJobRepository } from "../../../repositories/job/job.repository.interface";
import { PaginationMeta } from "../../../utils/apiResponse.utils";
import { IAdminJobService } from "../interfaces/admin-job.service.interface";
import { AppError } from "../../../errors/app.error.";
import { IJobApplicationRepository } from "../../../repositories/application/job-application.repository.interface";
import { IJobApplication } from "../../../models/job-application/job-application.interface";

export class AdminJobService implements IAdminJobService {
    constructor(private _jobRepository: IJobRepository, private _applicationRepository: IJobApplicationRepository) {}

    async getAllJobs(
        page: number,
        limit: number,
        filters?: Partial<IJob>
    ): Promise<{ jobs: IJob[]; paginationMeta: PaginationMeta }> {
        const [jobs, total] = await this._jobRepository.findAllJobs(page, limit, filters as FilterQuery<IJob>);

        const totalPages = Math.ceil(total / limit);
        const paginationMeta: PaginationMeta = {
            page,
            limit,
            totalItems: total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };

        return { jobs, paginationMeta };
    }

    async getJobById(jobId: string): Promise<IJob> {
        const job = await this._jobRepository.findById(jobId);

        if (!job) {
            throw new AppError("Job not found", 404);
        }

        return job;
    }

    async getApplicationsByJob(jobId: string, page: number, limit: number): Promise<[IJobApplication[], PaginationMeta]> {
        const [applications, total] = await this._applicationRepository.findByJob(jobId, page, limit);

        if (!applications) {
            throw new AppError("Applications not found", 404);
        }

        const totalPages = Math.ceil(total / limit);
        const paginationMeta: PaginationMeta = {
            page,
            limit,
            totalItems: total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };

        return [applications, paginationMeta];
    }

    async verifyJob(jobId: string): Promise<IJob> {
        const job = await this._jobRepository.findById(jobId);

        if (!job) {
            throw new AppError("Job not found", 404);
        }

        if (job.isVerified) {
            throw new AppError("Job is already verified", 400);
        }

        const updatedJob = await this._jobRepository.updateById(jobId, {
            isVerified: true,
            status: "active",
        });

        if (!updatedJob) {
            throw new AppError("Failed to verify job", 500);
        }

        return updatedJob;
    }

    async blockJob(jobId: string): Promise<IJob> {
        const job = await this._jobRepository.findById(jobId);

        if (!job) {
            throw new AppError("Job not found", 404);
        }

        if (job.status === "closed") {
            throw new AppError("Job is already blocked", 400);
        }

        const updatedJob = await this._jobRepository.updateById(jobId, {
            status: "closed",
            isVerified: false,
        });

        if (!updatedJob) {
            throw new AppError("Failed to block job", 500);
        }

        return updatedJob;
    }

    async unblockJob(jobId: string): Promise<IJob> {
        const job = await this._jobRepository.findById(jobId);

        if (!job) {
            throw new AppError("Job not found", 404);
        }

        if (job.status !== "closed") {
            throw new AppError("Job is not blocked", 400);
        }

        const updatedJob = await this._jobRepository.updateById(jobId, {
            status: "active",
            isVerified: true,
        });

        if (!updatedJob) {
            throw new AppError("Failed to unblock job", 500);
        }

        return updatedJob;
    }

    async deleteJob(jobId: string): Promise<boolean> {
        const job = await this._jobRepository.findById(jobId);

        if (!job) {
            throw new AppError("Job not found", 404);
        }

        return await this._jobRepository.softDelete(jobId);
    }
}
