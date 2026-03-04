import {
    COMPANY_JOB_APPLICATION_MESSAGES,
    INTERVIEW_MESSAGES,
} from "../../../constants/messages/company.messages.constants";
import { AppError } from "../../../errors-classes/app.error.";
import { JOB_APPLICATION_STATUSES } from "../../../models/job-application/job-application.interface";
import { ICompanyJobApplicationServiceInterface } from "../../../services/application/interfaces/company-job-application.service.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { ICompanyJobApplicationController } from "../interfaces/company-job-application.controller.interface";
import { Readable } from "stream";

import { Request, Response, NextFunction } from "express";
import { IInterviewService } from "../../../services/interview-service/interivew.service.interface";
import { ValidationError } from "../../../errors-classes/validation.error";
import { InterviewFilter } from "../../../interfaces/interview.interface";

export class CompanyJobApplicationController implements ICompanyJobApplicationController {
    constructor(
        private _applicationService: ICompanyJobApplicationServiceInterface,
        private _interviewService: IInterviewService,
    ) {}

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

    async scheduleInterview(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const companyId = req.user?.id;

            if (!companyId) {
                throw new ValidationError("Unauthorized access");
            }

            const { applicationId } = req.params;

            if (!applicationId) {
                throw new AppError("Application id not found", 401);
            }

            const interview = await this._interviewService.scheduleInterview(applicationId, req.body, companyId);

            return ApiResponse.success(res, INTERVIEW_MESSAGES.INTERVIEW_SCHEDULED_SUCCESSFULLY, interview);
        } catch (error) {
            next(error);
        }
    }

    async rescheduleInterview(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { applicationId, interviewId } = req.params;

            const { scheduledAt, round, reason } = req.body;

            const interview = await this._interviewService.rescheduleInterview(
                applicationId,
                interviewId,
                parseInt(round),
                new Date(scheduledAt),
                reason,
            );

            return ApiResponse.success(res, INTERVIEW_MESSAGES.INTERVIEW_RESCHEDULED, interview);
        } catch (error) {
            next(error);
        }
    }

    async cancelInterview(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { applicationId, interviewId } = req.params;
            const { reason, round } = req.body;

            const interview = await this._interviewService.cancelInterview(
                applicationId,
                interviewId,
                parseInt(round),
                reason,
            );

            return ApiResponse.success(res, INTERVIEW_MESSAGES.INTERVIEW_CANCELLED, interview);
        } catch (error) {
            next(error);
        }
    }

    async completeInterview(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { applicationId, interviewId } = req.params;
            const { feedback, rating, round } = req.body;

            const interview = await this._interviewService.completeInterview(
                applicationId,
                interviewId,
                parseInt(round),
                feedback,
                rating,
            );

            return res.status(200).json({
                success: true,
                message: INTERVIEW_MESSAGES.INTERVIEW_COMPLETED,
                data: interview,
            });
        } catch (error) {
            next(error);
        }
    }
    async updateInterview(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { applicationId, interviewId } = req.params;
            const { updateData } = req.body;

            const interview = await this._interviewService.updateInterview(applicationId, interviewId,  updateData);

            return res.status(200).json({
                success: true,
                message: INTERVIEW_MESSAGES.INTERVIEW_UPDATED,
                data: interview,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllInterviews(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const {
                companyId,
                jobId,
                applicationId,
                status,
                type,
                round,
                startDate,
                endDate,
                search,
                page = 1,
                limit = 10,
            } = req.query;

            const filter: InterviewFilter = {
                companyId: companyId as string,
                jobId: jobId as string,
                applicationId: applicationId as string,
                status: status ? (status as string).split(",") : undefined,
                type: type ? (type as string).split(",") : undefined,
                round: round ? parseInt(round as string) : undefined,
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
                search: search as string,
            };

            const { interviews, paginationMeta } = await this._interviewService.getInterviews(
                filter,
                parseInt(page as string),
                parseInt(limit as string),
            );

            return ApiResponse.success(res, INTERVIEW_MESSAGES.INTERVIEWS_FETCHED, interviews, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

    async getPopulatedInterviewById(req: Request, res: Response, next: NextFunction) {
        try {
            const { interviewId } = req.params;

            if (!interviewId) {
                throw new AppError("Interview ID is required", 400);
            }

            const interview = await this._interviewService.getPopulatedInterviewById(interviewId);

            return ApiResponse.success(res, INTERVIEW_MESSAGES.INTERVIEW_FETCHED, interview);
        } catch (error) {
            next(error);
        }
    }

    async getInterviewStats(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { companyId, jobId, applicationId } = req.query;

            const filter: Partial<InterviewFilter> = {
                companyId: companyId as string,
                jobId: jobId as string,
                applicationId: applicationId as string,
            };

            const stats = await this._interviewService.getInterviewStats(filter);

            return ApiResponse.success(res, INTERVIEW_MESSAGES.INTERVIEWS_STATISTICS_FETCHED_SUCCESSFULLY, stats);
        } catch (error) {
            next(error);
        }
    }
    async getUpcomingInterviews(req: Request, res: Response, next: NextFunction) {
        try {
            const companyId = req.user?.id;
            if (!companyId) {
                throw new ValidationError("Unauthorized access");
            }
            const { jobId, days = 7, page = 1, limit = 10 } = req.query;

            const filter = {
                companyId: companyId as string,
                jobId: jobId as string,
            };

            const { interviews, paginationMeta } = await this._interviewService.getUpcomingInterviews(
                filter,
                parseInt(days as string),
                parseInt(page as string),
                parseInt(limit as string),
            );

            return ApiResponse.success(
                res,
                INTERVIEW_MESSAGES.UPCOMING_INTERVIEWS_FETCHED,
                interviews,
                200,
                paginationMeta,
            );
        } catch (error) {
            next(error);
        }
    }
}
