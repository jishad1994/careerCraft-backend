import { Request, Response, NextFunction } from "express";
import { IUserJobApplicationController } from "../interfaces/user-job-application.controller.interface";
import { IUserJobApplicationService } from "../../../services/application/interfaces/user-job-application.service.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { AppError } from "../../../errors-classes/app.error.";
import { ValidationError } from "../../../errors-classes/validation.error";
import { USER_AUTH_MESSAGES } from "../../../constants/messages/user.messages.constants";
import { IInterviewService } from "../../../services/interview-service/interivew.service.interface";
import { InterviewFilter } from "../../../interfaces/interview.interface";
import {
    COMPANY_JOB_APPLICATION_MESSAGES,
    INTERVIEW_MESSAGES,
} from "../../../constants/messages/company.messages.constants";

export class UserJobApplicationController implements IUserJobApplicationController {
    constructor(
        private _userApplicationService: IUserJobApplicationService,
        private _interviewService: IInterviewService,
    ) {}

    async checkApplicationStatus(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) throw new AppError("User not found", 401);

            const jobId = req.params.jobId;
            if (!jobId) throw new AppError("Job ID is required", 400);

            const result = await this._userApplicationService.checkApplicationStatus(jobId, user.id);

            return ApiResponse.success(res, "Application status checked", result);
        } catch (error) {
            next(error);
        }
    }

    async getApplicationById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const applicationId = req.params.id;
            if (!applicationId) throw new AppError("Application ID is required", 400);

            const application = await this._userApplicationService.getApplicationById(applicationId);

            return ApiResponse.success(res, COMPANY_JOB_APPLICATION_MESSAGES.FETCH_SUCCESSFULL, application);
        } catch (error) {
            next(error);
        }
    }

    async getUserApplications(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) throw new AppError("User not found", 401);

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as string;

            const { applications, paginationMeta } = await this._userApplicationService.getUserApplications(
                user.id,
                page,
                limit,
                status,
            );

            return ApiResponse.success(res, "Applications fetched successfully", applications, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

    async withdrawApplication(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) throw new AppError("User not found", 401);

            const applicationId = req.params.id;
            if (!applicationId) throw new AppError("Application ID is required", 400);

            const updatedApplication = await this._userApplicationService.withdrawApplication(applicationId, user.id);

            return ApiResponse.success(res, "Application withdrawn successfully", updatedApplication);
        } catch (error) {
            next(error);
        }
    }
    async getAllInterviews(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user?.id;

            if (!userId) throw new ValidationError(USER_AUTH_MESSAGES.USER_NOT_FOUND, 401);

            const { jobId, applicationId, status, type, round, startDate, endDate, search } = req.query;

            const page = Number(req.query?.page) || 1;
            const limit = Number(req.query?.limit) || 10;

            const filter: InterviewFilter = {
                jobId: jobId as string,
                applicationId: applicationId as string,
                applicantId: userId as string,
                status: status ? (status as string).split(",") : undefined,
                type: type ? (type as string).split(",") : undefined,
                round: round ? parseInt(round as string) : undefined,
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
                search: search as string,
            };

            const { interviews, paginationMeta } = await this._interviewService.getInterviews(filter, page, limit);

            return ApiResponse.success(res, INTERVIEW_MESSAGES.INTERVIEWS_FETCHED, interviews, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

    async getPopulatedInterviewById(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;

            if (!userId) throw new ValidationError(USER_AUTH_MESSAGES.USER_NOT_FOUND, 401);

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
            const userId = req.user?.id;

            if (!userId) throw new ValidationError(USER_AUTH_MESSAGES.USER_NOT_FOUND, 401);

            const { jobId, applicationId } = req.query;

            const filter: Partial<InterviewFilter> = {
                applicantId: userId as string,
                jobId: jobId as string,
                applicationId: applicationId as string,
            };

            const stats = await this._interviewService.getInterviewStats(filter);

            return ApiResponse.success(res, INTERVIEW_MESSAGES.INTERVIEWS_STATISTICS_FETCHED_SUCCESSFULLY, stats);
        } catch (error) {
            next(error);
        }
    }
}
