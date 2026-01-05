import slugify from "slugify";
import { IJob, JobStatus } from "../../../models/job/job.interface";
import { IJobRepository } from "../../../repositories/job/job.repository.interface";
import { ICompanyJobService } from "../interfaces/company-job.service.interface";
import mongoose from "mongoose";
import { PaginationMeta } from "../../../utils/apiResponse.utils";
import { AppError } from "../../../errors/app.error.";

export class CompanyJobService implements ICompanyJobService {
    constructor(private _jobRepository: IJobRepository) {}

    async createJob(companyId: string, jobData: Partial<IJob>): Promise<IJob> {
        const idSuffix = companyId.toString().slice(-6);
        const slug = `${slugify(jobData.title!, { lower: true })}-${idSuffix}`;
        const company = new mongoose.Types.ObjectId(companyId);
        const job = await this._jobRepository.create({
            ...jobData,
            company,
            slug,
            status: "draft",
        });

        return job;
    }

    async getCompanyJobs(
        companyId: string,
        page: number = 1,
        limit: number = 10,
        search?: string
    ): Promise<{ jobs: IJob[]; paginationMeta: PaginationMeta }> {
        const [jobs, total] = await this._jobRepository.findByCompany(companyId, page, limit, search);

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

    async getJobById(companyId: string, jobId: string): Promise<IJob> {
        const job = await this._jobRepository.findById(jobId);

        if (!job) {
            throw new AppError("Job not found", 404);
        }

        if (job.company.toString() !== companyId) {
            throw new AppError("Unauthorized access to this job", 403);
        }

        return job;
    }

    async updateJob(companyId: string, jobId: string, updates: Partial<IJob>): Promise<IJob> {
        await this.getJobById(companyId, jobId);

        if (updates.title) {
            updates.slug = this.generateSlug(updates.title);
        }

        const updatedJob = await this._jobRepository.updateById(jobId, updates);

        if (!updatedJob) {
            throw new AppError("Failed to update job", 500);
        }

        return updatedJob;
    }

    async updateJobStatus(companyId: string, jobId: string, status: string): Promise<IJob> {
        // Verify ownership
        await this.getJobById(companyId, jobId);

        const validStatuses = ["draft", "active", "paused", "closed"];

        if (!validStatuses.includes(status)) {
            throw new AppError("Invalid status", 400);
        }

        const updatedJob = await this._jobRepository.updateById(jobId, { status: status as JobStatus });

        if (!updatedJob) {
            throw new AppError("Failed to update job status", 500);
        }

        return updatedJob;
    }

    async deleteJob(companyId: string, jobId: string): Promise<boolean> {
        await this.getJobById(companyId, jobId); //literally checking job ownership

        return await this._jobRepository.softDelete(jobId);
    }

    private generateSlug(title: string): string {
        return (
            title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "") +
            "-" +
            Date.now()
        );
    }
}
