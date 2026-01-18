import { AppError } from "../../../errors/app.error.";
import { ICompanyJobApplicationServiceInterface } from "../../../services/application/interfaces/company-job-application.service.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { ICompanyJobApplicationController } from "../interfaces/company-job-application.controller.interface";

import { Request, Response, NextFunction } from "express";

export class CompanyJobApplicationController implements ICompanyJobApplicationController {
    constructor(private _applicationService: ICompanyJobApplicationServiceInterface) {}

    async getApplicationById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const applicationId = req.params.id;
            if (!applicationId) throw new AppError("Application ID is required", 400);

            const application = await this._applicationService.getApplicationById(applicationId);

            return ApiResponse.success(res, "Application fetched successfully", application);
        } catch (error) {
            next(error);
        }
    }

    async getCompanyApplications(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AppError("User not found", 401);

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as string;
            const jobId = req.query.jobId as string;

            const filters: {
                status?: string;
                jobId?: string;
            } = {};
            if (status) filters.status = status;
            if (jobId) filters.jobId = jobId;

            const { applications, paginationMeta } = await this._applicationService.getCompanyApplications(
                company.id,
                page,
                limit,
                filters
            );

            return ApiResponse.success(res, "Applications fetched successfully", applications, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

    async getApplicationsByJob(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AppError("User not found", 401);

            const jobId = req.params.jobId;
            if (!jobId) throw new AppError("Job ID is required", 400);

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as string;

            const { applications, paginationMeta } = await this._applicationService.getJobApplications(
                jobId,
                page,
                limit,
                status
            );

            return ApiResponse.success(res, "Applications fetched successfully", applications, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

     async updateApplicationStatus(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AppError("User not found", 401);

            const applicationId = req.params.id;
            const { status, notes } = req.body;

            if (!applicationId) throw new AppError("Application ID is required", 400);
            if (!status) throw new AppError("Status is required", 400);

            const updatedApplication = await this._applicationService.updateApplicationStatus(
                applicationId,
                status,
                company.id,
                notes
            );

            return ApiResponse.success(res, "Application status updated successfully", updatedApplication);
        } catch (error) {
            next(error);
        }
    }

    async markAsViewed(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AppError("User not found", 401);

            const applicationId = req.params.id;
            if (!applicationId) throw new AppError("Application ID is required", 400);

            const updatedApplication = await this._applicationService.markApplicationAsViewed(applicationId, company.id);

            return ApiResponse.success(res, "Application marked as viewed", updatedApplication);
        } catch (error) {
            next(error);
        }
    }

    async addNotes(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AppError("User not found", 401);

            const applicationId = req.params.id;
            const { notes } = req.body;

            if (!applicationId) throw new AppError("Application ID is required", 400);
            if (!notes) throw new AppError("Notes are required", 400);

            const updatedApplication = await this._applicationService.addNotes(applicationId, notes);

            return ApiResponse.success(res, "Notes added successfully", updatedApplication);
        } catch (error) {
            next(error);
        }
    }

    async getStatistics(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AppError("User not found", 401);

            const statistics = await this._applicationService.getApplicationStatistics(company.id);

            return ApiResponse.success(res, "Statistics fetched successfully", statistics);
        } catch (error) {
            next(error);
        }
    }
}
