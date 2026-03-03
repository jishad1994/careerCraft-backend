import { COMPANY_JOB_APPLICATION_MESSAGES } from "../../../constants/messages/company.messages.constants";
import { AppError } from "../../../errors-classes/app.error.";
import { JOB_APPLICATION_STATUSES } from "../../../models/job-application/job-application.interface";
import { ICompanyJobApplicationServiceInterface } from "../../../services/application/interfaces/company-job-application.service.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { ICompanyJobApplicationController } from "../interfaces/company-job-application.controller.interface";
import { Readable } from "stream";

import { Request, Response, NextFunction } from "express";

export class CompanyJobApplicationController implements ICompanyJobApplicationController {
    constructor(private _applicationService: ICompanyJobApplicationServiceInterface) {}

    async getApplicationById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const applicationId = req.params.id;
            if (!applicationId) throw new AppError("Application ID is required", 400);

            const application = await this._applicationService.getApplicationDetailsById(applicationId);

            return ApiResponse.success(res, COMPANY_JOB_APPLICATION_MESSAGES.FETCH_SUCCESSFULL, application);
        } catch (error) {
            next(error);
        }
    }

    async getApplicantsList(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const companyId = req.user?.id;

            if (!companyId) throw new AppError("User not found", 401);

            const {
                page = 1,
                limit = 10,
                search = "",
                status,
                skills,
                experience,
                education,
                availability,
                dateRange,
                startDate,
                endDate,
                jobId,
            } = req.query;

            const filters = {
                status: status ? (status as string).split(",") : undefined,
                skills: skills ? (skills as string).split(",") : undefined,
                experience: experience ? (experience as string).split(",") : undefined,
                education: education ? (education as string).split(",") : undefined,
                availability: availability ? (availability as string).split(",") : undefined,
                dateRange: dateRange as string,
                startDate: startDate as string,
                endDate: endDate as string,
                jobId: jobId as string,
            };

            const { applications: candidates, paginationMeta } = await this._applicationService.getApplicantsList(
                companyId!,
                Number(page),
                Number(limit),
                search as string,
                filters,
            );

            return ApiResponse.success(
                res,
                COMPANY_JOB_APPLICATION_MESSAGES.FETCH_SUCCESSFULL,
                candidates,
                200,
                paginationMeta,
            );
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
                filters,
            );

            return ApiResponse.success(
                res,
                COMPANY_JOB_APPLICATION_MESSAGES.FETCH_SUCCESSFULL,
                applications,
                200,
                paginationMeta,
            );
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
                status,
            );

            return ApiResponse.success(
                res,
                COMPANY_JOB_APPLICATION_MESSAGES.FETCH_SUCCESSFULL,
                applications,
                200,
                paginationMeta,
            );
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
                notes,
            );

            return ApiResponse.success(res, COMPANY_JOB_APPLICATION_MESSAGES.STATUS_UPDATED, updatedApplication);
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

            return ApiResponse.success(res, COMPANY_JOB_APPLICATION_MESSAGES.MARKED_AS_VIEWED, updatedApplication);
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

            return ApiResponse.success(res, COMPANY_JOB_APPLICATION_MESSAGES.ADD_NOTES_SUCCESSFULL, updatedApplication);
        } catch (error) {
            next(error);
        }
    }

    async getStatistics(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AppError("User not found", 401);

            const statistics = await this._applicationService.getApplicationStatistics(company.id);

            return ApiResponse.success(res, COMPANY_JOB_APPLICATION_MESSAGES.STATISTIC_FETCH_SUCCESSFULL, statistics);
        } catch (error) {
            next(error);
        }
    }

    async rejectApplication(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { applicationId } = req.params;
            const { feedback } = req.body;

            const updatedApplication = await this._applicationService.updateApplicationStatus(
                applicationId,
                JOB_APPLICATION_STATUSES.REJECTED,
                undefined,
                feedback,
            );

            return ApiResponse.success(res, COMPANY_JOB_APPLICATION_MESSAGES.REJECTED, updatedApplication);
        } catch (error) {
            next(error);
        }
    }

    async toggleFlag(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { applicationId } = req.params;
            const { isStarred } = req.body;

            const updatedApplication = await this._applicationService.toggleStarApplication(applicationId, isStarred);

            const flaggedStatus = isStarred ? "flagged" : "unflagged";
            return ApiResponse.success(
                res,
                COMPANY_JOB_APPLICATION_MESSAGES.TOGGLE_FLAG_SUCCESSFULL(flaggedStatus),
                updatedApplication,
            );
        } catch (error) {
            next(error);
        }
    }

    async getApplicationResume(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const company = req.user;
            if (!company) throw new AppError("User not found", 401);
            const applicationId = req.params.id;

            if (!applicationId) throw new AppError("Application ID is required", 400);

            const mode = (req.query.mode as string) || "view";

            const fileStream = await this._applicationService.getApplicationResume(applicationId, company.id);

            res.setHeader("Content-Type", fileStream.ContentType || "application/pdf");

            if (mode === "download") {
                res.setHeader("Content-Disposition", `attachment; filename="resume-${applicationId}.pdf"`);
            } else {
                res.setHeader("Content-Disposition", `inline; filename="resume-${applicationId}.pdf"`);
            }

            (fileStream.Body as Readable).pipe(res);
        } catch (error) {
            next(error);
        }
    }
}
