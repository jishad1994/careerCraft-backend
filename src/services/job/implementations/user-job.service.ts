import { AppError } from "../../../errors/app.error.";
import { IJobApplication } from "../../../models/job-application/job-application.interface";
import { IJob } from "../../../models/job/job.interface";
import { IJobApplicationRepository } from "../../../repositories/application/job-application.repository.interface";
import { IJobRepository, JobSearchFilters } from "../../../repositories/job/job.repository.interface";
import { PaginationMeta } from "../../../utils/apiResponse.utils";
import { IUserJobService } from "../interfaces/user-job.service.interface";

export class UserJobService implements IUserJobService {
    constructor(private _jobRepository: IJobRepository, private _applicationRepository: IJobApplicationRepository) {}

    async searchJobs(
        filters: JobSearchFilters,
        page: number = 1,
        limit: number = 10
    ): Promise<{ jobs: IJob[]; paginationMeta: PaginationMeta }> {
        const searchFilters = {
            ...filters,
            status: "active",
            isVerified: true,
        };

        const [jobs, total] = await this._jobRepository.search(searchFilters, page, limit);

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

        if (job.status !== "active" || !job.isVerified) {
            throw new AppError("Job not available", 404);
        }

        await this._jobRepository.incrementViews(jobId);

        return job;
    }

    async getJobBySlug(slug: string): Promise<IJob> {
        const job = await this._jobRepository.findBySlug(slug);

        if (!job) {
            throw new AppError("Job not found", 404);
        }

        if (job.status !== "active" || !job.isVerified) {
            throw new AppError("Job not available", 404);
        }

        await this._jobRepository.incrementViews(job._id.toString());

        return job;
    }

    async applyForJob(userId: string, jobId: string): Promise<IJobApplication> {
        const job = await this.getJobById(jobId);

        const existingApplication = await this._applicationRepository.findByUserAndJob(userId, jobId);

        if (existingApplication) {
            throw new AppError("You have already applied for this job", 400);
        }

        const application = await this._applicationRepository.create({
            user: userId,
            job: jobId,
            company: job.company,
            status: "pending",
        });

        await this._jobRepository.incrementApplications(jobId);

        return application;
    }
}
