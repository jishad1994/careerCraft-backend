import mongoose from "mongoose";
import { ValidationError } from "../../../errors-classes/validation.error";
import {
    JobApplicationStatus,
    IJobApplication,
    IJobApplicationDetails,
} from "../../../models/job-application/job-application.interface";
import { IJobApplicationRepository } from "../../../repositories/application/job-application.repository.interface";
import { IUserJobApplicationService } from "../interfaces/user-job-application.service.interface";
import { AppError } from "../../../errors-classes/app.error.";
import { PaginationMeta } from "../../../utils/apiResponse.utils";
import { IFileService } from "../../file-service/interfaces/file.service.interface";
import { ISocketService } from "../../../shared/services/socket/interface/socket.service.interface";
import { INotificationService } from "../../notification/interface/notification.service.interface";
import { NOTIFICATION_PRIORITIES, NOTIFICATION_TYPES } from "../../../models/notifications/notification.interface";

export class UserJobApplicationService implements IUserJobApplicationService {
    constructor(
        private _jobApplicationRepository: IJobApplicationRepository,
        private _fileService: IFileService,
        private _notificationService: INotificationService,
        private _socketServer: ISocketService,
    ) {}

    async getApplicationStatus(
        userId: string,
        jobId: string,
    ): Promise<{ appliedStatus: boolean; applicationStatus: string | null }> {
        const existingApplication = await this._jobApplicationRepository.findByUserAndJob(userId, jobId);

        return { appliedStatus: !!existingApplication, applicationStatus: existingApplication?.status ?? null };
    }

    async getApplicationById(applicationId: string): Promise<IJobApplicationDetails> {
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            throw new ValidationError("Invalid application ID");
        }

        const application = await this._jobApplicationRepository.findApplicationDetailsById(applicationId);
        if (!application) {
            throw new AppError("Application not found", 404);
        }
        const resumeSignedURL = await this._fileService.generateSignedUrl(application.resume.fileKey);

        application.resume.signedURL = resumeSignedURL;

        return application;
    }

    async getUserApplications(
        userId: string,
        page: number = 1,
        limit: number = 10,
        status?: string,
    ): Promise<{ applications: IJobApplication[]; paginationMeta: PaginationMeta }> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid user ID");
        }

        const [applications, total] = await this._jobApplicationRepository.findByApplicant(userId, page, limit, status);

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

        const application = await this._jobApplicationRepository.findById(applicationId);
        if (!application) {
            throw new AppError("Application not found", 404);
        }

        // Update status
        const updates: Partial<IJobApplication> = {
            status: status as JobApplicationStatus,
            lastUpdatedAt: new Date(),
        };

        const statusUpdate = {
            status,
            changedAt: new Date(),
            changedBy: changedBy ? new mongoose.Types.ObjectId(changedBy) : undefined,
            notes,
        };

        const updatedApplication = await this._jobApplicationRepository.updateById(applicationId, {
            ...updates,
            $push: { statusHistory: statusUpdate },
        });

        if (!updatedApplication) {
            throw new AppError("Failed to update application", 500);
        }

        return updatedApplication;
    }

    async withdrawApplication(applicationId: string, userId: string): Promise<IJobApplication> {
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            throw new ValidationError("Invalid application ID");
        }

        const application = await this._jobApplicationRepository.findById(applicationId);
        if (!application) {
            throw new AppError("Application not found", 404);
        }

        if (application.applicant._id.toString() !== userId.toString()) {
            throw new AppError("Unauthorized", 403);
        }

        // Can only withdraw if status is pending or reviewing
        if (!["pending", "reviewing"].includes(application.status)) {
            throw new AppError("Cannot withdraw application at this stage", 400);
        }

        const updatedApplication = await this.updateApplicationStatus(
            applicationId,
            "withdrawn",
            userId,
            "Withdrawn by applicant",
        );
        const notification = await this._notificationService.createNotification({
            userId: application.company.toString(),
            userModel: "Company",
            type: NOTIFICATION_TYPES.APPLICATION_STATUS,
            title: "Application Withdrawn",
            message: `A candidate has withdrawn their application`,
            priority: NOTIFICATION_PRIORITIES.MEDIUM,
            metadata: { applicationId: new mongoose.Types.ObjectId(applicationId) },
        });

        await this._socketServer.sendNotificationToUser(application.company.toString(), notification);

        return updatedApplication;
    }

    async checkApplicationStatus(
        jobId: string,
        userId: string,
    ): Promise<{ hasApplied: boolean; application?: IJobApplication }> {
        if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid ID");
        }

        const application = await this._jobApplicationRepository.findByUserAndJob(userId, jobId);

        return {
            hasApplied: !!application,
            application: application || undefined,
        };
    }
}
