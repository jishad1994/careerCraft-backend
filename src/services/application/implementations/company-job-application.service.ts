import mongoose from "mongoose";
import { ValidationError } from "../../../errors-classes/validation.error";
import {
    IJobApplication,
    IJobApplicationDetails,
    JobApplicationStatistics,
    JobApplicationStatus,
} from "../../../models/job-application/job-application.interface";
import {
    CandidatesFilters,
    IJobApplicationRepository,
} from "../../../repositories/application/job-application.repository.interface";
import { ICompanyJobApplicationServiceInterface } from "../interfaces/company-job-application.service.interface";
import { AppError } from "../../../errors-classes/app.error.";
import { PaginationMeta } from "../../../utils/apiResponse.utils";
import { IFileService } from "../../file-service/interfaces/file.service.interface";
import { GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { INotificationService } from "../../notification/interface/notification.service.interface";
import { ISocketService } from "../../../shared/services/socket/interface/socket.service.interface";
import { CreateNotificationParams } from "../../../interfaces/notification-interfaces";
import { NOTIFICATION_PRIORITIES, NOTIFICATION_TYPES } from "../../../models/notifications/notification.interface";
import { NOTIFICATION_MESSAGES } from "../../../constants/messages/notification.messages";

export class CompanyJobApplicationService implements ICompanyJobApplicationServiceInterface {
    constructor(
        private _applicationRepository: IJobApplicationRepository,
        private _fileService: IFileService,
        private _notificationService: INotificationService,
        private _socketServer: ISocketService,
    ) {}

    async getApplicantsList(
        companyId: string,
        page: number,
        limit: number,
        search: string,
        filters: CandidatesFilters,
    ): Promise<{ applications: IJobApplicationDetails[]; paginationMeta: PaginationMeta }> {
        const [applications, total] = await this._applicationRepository.getApplicantsList(
            companyId,
            page,
            limit,
            search,
            filters,
        );

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

    async getApplicationDetailsById(applicationId: string): Promise<IJobApplicationDetails> {
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            throw new ValidationError("Invalid application ID");
        }

        const application = await this._applicationRepository.findApplicationDetailsById(applicationId);
        if (!application) {
            throw new AppError("Application not found", 404);
        }

        return application;
    }

    async getCompanyApplications(
        companyId: string,
        page: number = 1,
        limit: number = 10,
        filters?: { status?: string; jobId?: string },
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
        status?: string,
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
        notes?: string,
    ): Promise<IJobApplicationDetails> {
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

        await this._applicationRepository.updateById(applicationId, {
            ...updates,
            $push: { statusHistory: statusUpdate },
        });

        const updatedApplication = await this.getApplicationDetailsById(applicationId);

        if (!updatedApplication) {
            throw new AppError("Failed to update application", 500);
        }

        const notificationParams: CreateNotificationParams = {
            userId: updatedApplication.applicant.toString(),
            type: NOTIFICATION_TYPES.APPLICATION_STATUS,
            title: NOTIFICATION_MESSAGES.APPLICATION_STATUS_UPDATED,
            message: `Your job application status has changed to ${updatedApplication.status}`,
            priority: NOTIFICATION_PRIORITIES.HIGH,
            metadata: {
                applicationId: updatedApplication._id,
            },
        };

        console.log("user id:", notificationParams.userId, typeof notificationParams.userId);
        // const notification = await this._notificationService.createNotification(notificationParams);

        // await this._socketServer.sendNotificationToUser( notification.userId.toString(), notification);

        return updatedApplication;
    }

    async markApplicationAsViewed(applicationId: string, viewedBy: string): Promise<IJobApplicationDetails> {
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            throw new ValidationError("Invalid application ID");
        }

        const updates: Partial<IJobApplication> = {
            viewedAt: new Date(),
            viewedBy: new mongoose.Types.ObjectId(viewedBy),
        };

        await this._applicationRepository.updateById(applicationId, updates);

        const updatedApplication = this.getApplicationDetailsById(applicationId);

        if (!updatedApplication) {
            throw new AppError("Application not found", 404);
        }

        return updatedApplication;
    }
    async toggleStarApplication(applicationId: string, isStarred: boolean): Promise<IJobApplicationDetails> {
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            throw new ValidationError("Invalid application ID");
        }

        const application = await this._applicationRepository.findById<IJobApplication>(applicationId);

        if (!application) {
            throw new AppError("Application not found", 404);
        }

        application.isStarred = isStarred;

        await application.save();
        const updatedApplication = this.getApplicationDetailsById(applicationId);
        return updatedApplication;
    }

    async addNotes(applicationId: string, notes: string): Promise<IJobApplicationDetails> {
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            throw new ValidationError("Invalid application ID");
        }

        const updates: Partial<IJobApplication> = {
            notes,
            lastUpdatedAt: new Date(),
        };

        await this._applicationRepository.updateById(applicationId, updates);

        const updatedApplication = this.getApplicationDetailsById(applicationId);
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

    async getApplicationResume(applicationId: string, companyId: string): Promise<GetObjectCommandOutput> {
        const application = await this._applicationRepository.findById<IJobApplication>(applicationId);
        if (!application) throw new AppError("Application not found", 404);

        if (application.company.toString() !== companyId) {
            throw new AppError("Unauthorized", 403);
        }

        const resume = application.resume;
        if (!resume) throw new AppError("Application does not have a resume", 404);

        return this._fileService.getFile(resume.fileKey);
    }
}
