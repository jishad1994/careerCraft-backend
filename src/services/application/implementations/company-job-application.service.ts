import mongoose from "mongoose";
import { ValidationError } from "../../../errors/validation.error";
import {
    IJobApplication,
    JobApplicationStatistics,
    JobApplicationStatus,
} from "../../../models/job-application/job-application.interface";
import { IJobApplicationRepository } from "../../../repositories/application/job-application.repository.interface";
import { ICompanyJobApplicationServiceInterface } from "../interfaces/company-job-application.service.interface";
import { AppError } from "../../../errors/app.error.";
import { PaginationMeta } from "../../../utils/apiResponse.utils";

export class CompanyJobApplicationService implements ICompanyJobApplicationServiceInterface {
    constructor(private _applicationRepository: IJobApplicationRepository) {}

    async getApplicationById(applicationId: string): Promise<IJobApplication> {
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            throw new ValidationError("Invalid application ID");
        }

        const application = await this._applicationRepository.findById(applicationId);
        if (!application) {
            throw new AppError("Application not found", 404);
        }

        return application;
    }

    async getCompanyApplications(
        companyId: string,
        page: number = 1,
        limit: number = 10,
        filters?: { status?: string; jobId?: string }
    ): Promise<{ applications: IJobApplication[]; paginationMeta: PaginationMeta }> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid company ID");
        }

        const [applications, total] = await this._applicationRepository.findByCompany(companyId, page, limit, filters);

        const totalPages = Math.ceil(total / limit);
        const paginationMeta: PaginationMeta = {
            page,
            limit,
            totalItems: total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };

        return { applications, paginationMeta };
    }
    async getJobApplications(
        jobId: string,
        page: number = 1,
        limit: number = 10,
        status?: string
    ): Promise<{ applications: IJobApplication[]; paginationMeta: PaginationMeta }> {
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            throw new ValidationError("Invalid job ID");
        }

        const [applications, total] = await this._applicationRepository.findByJob(jobId, page, limit, status);

        const totalPages = Math.ceil(total / limit);
        const paginationMeta: PaginationMeta = {
            page,
            limit,
            totalItems: total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };

        return { applications, paginationMeta };
    }

    async updateApplicationStatus(
        applicationId: string,
        status: string,
        changedBy?: string,
        notes?: string
    ): Promise<IJobApplication> {
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            throw new ValidationError("Invalid application ID");
        }

        const validStatuses = [
            "pending",
            "reviewing",
            "shortlisted",
            "interviewed",
            "offered",
            "rejected",
            "withdrawn",
            "hired",
        ];
        if (!validStatuses.includes(status)) {
            throw new ValidationError("Invalid status");
        }

        const application = await this._applicationRepository.findById(applicationId);
        if (!application) {
            throw new AppError("Application not found", 404);
        }

        // Update status
        const updates: Partial<IJobApplication> = {
            status: status as JobApplicationStatus,
            lastUpdatedAt: new Date(),
        };

        // Add to status history
        const statusUpdate = {
            status,
            changedAt: new Date(),
            changedBy: changedBy ? new mongoose.Types.ObjectId(changedBy) : undefined,
            notes,
        };

        const updatedApplication = await this._applicationRepository.updateById(applicationId, {
            ...updates,
            $push: { statusHistory: statusUpdate },
        });

        if (!updatedApplication) {
            throw new AppError("Failed to update application", 500);
        }

        return updatedApplication;
    }

    async markApplicationAsViewed(applicationId: string, viewedBy: string): Promise<IJobApplication> {
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            throw new ValidationError("Invalid application ID");
        }

        const updates: Partial<IJobApplication> = {
            viewedAt: new Date(),
            viewedBy: new mongoose.Types.ObjectId(viewedBy),
        };

        const updatedApplication = await this._applicationRepository.updateById(applicationId, updates);
        if (!updatedApplication) {
            throw new AppError("Application not found", 404);
        }

        return updatedApplication;
    }
    async toggleStarApplication(applicationId: string): Promise<IJobApplication> {
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            throw new ValidationError("Invalid application ID");
        }

        const application = await this._applicationRepository.findById(applicationId);
        if (!application) {
            throw new AppError("Application not found", 404);
        }

        const updates: Partial<IJobApplication> = {
            isStarred: !application.isStarred,
        };

        const updatedApplication = await this._applicationRepository.updateById(applicationId, updates);
        if (!updatedApplication) {
            throw new AppError("Failed to update application", 500);
        }

        return updatedApplication;
    }

    async addNotes(applicationId: string, notes: string): Promise<IJobApplication> {
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            throw new ValidationError("Invalid application ID");
        }

        const updates: Partial<IJobApplication> = {
            notes,
            lastUpdatedAt: new Date(),
        };

        const updatedApplication = await this._applicationRepository.updateById(applicationId, updates);
        if (!updatedApplication) {
            throw new AppError("Application not found", 404);
        }

        return updatedApplication;
    }

    async getApplicationStatistics(companyId: string): Promise<JobApplicationStatistics> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid company ID");
        }

        const [allApplications] = await this._applicationRepository.findByCompany(companyId, 1, 10000);

        const stats = {
            total: allApplications.length,
            pending: allApplications.filter((a) => a.status === "pending").length,
            reviewing: allApplications.filter((a) => a.status === "reviewing").length,
            shortlisted: allApplications.filter((a) => a.status === "shortlisted").length,
            interviewed: allApplications.filter((a) => a.status === "interviewed").length,
            offered: allApplications.filter((a) => a.status === "offered").length,
            rejected: allApplications.filter((a) => a.status === "rejected").length,
            hired: allApplications.filter((a) => a.status === "hired").length,
            withdrawn: allApplications.filter((a) => a.status === "withdrawn").length,
        };

        return stats;
    }
}
