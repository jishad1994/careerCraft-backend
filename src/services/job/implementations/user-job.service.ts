import { AppError } from "../../../errors-classes/app.error.";
import { IJobApplication } from "../../../models/job-application/job-application.interface";
import { IJob } from "../../../models/job/job.interface";
import { IJobApplicationRepository } from "../../../repositories/application/job-application.repository.interface";
import { IJobRepository, JobSearchFilters } from "../../../repositories/job/job.repository.interface";
import { PaginationMeta } from "../../../utils/apiResponse.utils";
import { IUserJobService } from "../interfaces/user-job.service.interface";
import { IFileService } from "../../file-service/interfaces/file.service.interface";
import { ValidationError } from "../../../errors-classes/validation.error";
import mongoose from "mongoose";
import { ISocketService } from "../../../shared/services/socket/interface/socket.service.interface";
import { INotificationService } from "../../notification/interface/notification.service.interface";
import { IUserRepository } from "../../../repositories/user/user.repository.interface";

export class UserJobService implements IUserJobService {
    constructor(
        private _jobRepository: IJobRepository,
        private _applicationRepository: IJobApplicationRepository,
        private _fileService: IFileService,
        private _notificationService: INotificationService,
        private _socketServer: ISocketService,
        private _userRepository: IUserRepository,
    ) {}

    async searchJobs(
        filters: JobSearchFilters,
        page: number = 1,
        limit: number = 10,
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

    async saveCoverLetter(file: Express.Multer.File, userId: string): Promise<{ key: string; signedUrl: string }> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid user id");
        }
        const key = await this._fileService.uplodaFile(file, "coverLetters", userId);

        const signedUrl = await this._fileService.generateSignedUrl(key, 3600 * 24 * 6);

        return { key, signedUrl };
    }

    async applyForJob(userId: string, applicationData: IJobApplication): Promise<IJobApplication> {
        const existingApplication = await this._applicationRepository.findByUserAndJob(
            userId,
            applicationData.job.toString(),
        );

        if (existingApplication) {
            throw new AppError("You have already applied for this job", 400);
        }

        const user = await this._userRepository.findById(userId);

        if (!user) {
            throw new AppError("User not found");
        }

        const job = await this._jobRepository.findById(applicationData.job.toString());
        if (!job) {
            throw new AppError("Job not found");
        }
        const application = await this._applicationRepository.create(applicationData);

        await this._jobRepository.incrementApplications(application.job.toString());

        const notification = await this._notificationService.notifyNewApplication(
            applicationData.company.toString(),
            `${user.firstName} ${user.lastName ?? ""}`,
            job.title,
            application._id.toString(),
        );

        await this._socketServer.sendNotificationToUser(job.company.toString(), notification);

        return application;
    }
}
