import { IAdminJobService } from "../../../services/job/interfaces/admin-job.service.interface";

import { Request, Response, NextFunction } from "express";
import { IAdminJobController } from "../interfaces/admin-job.controller.interface";
import { AuthError } from "../../../errors/auth.error";
import { IJob, JobStatus } from "../../../models/job/job.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { ADMIN_JOB_MESSAGES } from "../../../constants/messages/admin.messages";
import { HTTP_MESSAGES } from "../../../constants/messages/http.messages.constants";

export class AdminJobController implements IAdminJobController {
    constructor(private _adminJobService: IAdminJobService) {}

    async getAllJobs(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const admin = req.user;
            if (!admin) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            // Optional filters
            const filters: Partial<IJob> = {};
            if (req.query.status) filters.status = req.query.status.toString() as JobStatus;
            if (req.query.isVerified) filters.isVerified = req.query.isVerified === "true";

            const { jobs, paginationMeta } = await this._adminJobService.getAllJobs(page, limit, filters);

            return ApiResponse.success(res, ADMIN_JOB_MESSAGES.FETCH_SUCCESS, jobs, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

    async getJobById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const admin = req.user;
            if (!admin) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);

            const id = String(req.params.id);

            const job = await this._adminJobService.getJobById(id);

            return ApiResponse.success(res, ADMIN_JOB_MESSAGES.FETCH_SUCCESS, job);
        } catch (error) {
            next(error);
        }
    }
    async getApplicationsByJob(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const admin = req.user;
            if (!admin) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);

            const jobId = String(req.params.id);
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const [applications, paginationMeta] = await this._adminJobService.getApplicationsByJob(jobId, page, limit);

            return ApiResponse.success(res, ADMIN_JOB_MESSAGES.FETCH_SUCCESS, applications, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

    async verifyJob(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const admin = req.user;
            if (!admin) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);

            const { jobId } = req.params;

            const job = await this._adminJobService.verifyJob(jobId);

            return ApiResponse.success(res, ADMIN_JOB_MESSAGES.VERIFIED, job);
        } catch (error) {
            next(error);
        }
    }

    async blockJob(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const admin = req.user;
            if (!admin) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);

            const { jobId } = req.params;

            const job = await this._adminJobService.blockJob(jobId);

            return ApiResponse.success(res, ADMIN_JOB_MESSAGES.BLOCKED, job);
        } catch (error) {
            next(error);
        }
    }

    async unblockJob(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const admin = req.user;
            if (!admin) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);

            const { jobId } = req.params;

            const job = await this._adminJobService.unblockJob(jobId);

            return ApiResponse.success(res, ADMIN_JOB_MESSAGES.UNBLOCKED, job);
        } catch (error) {
            next(error);
        }
    }

    async deleteJob(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const admin = req.user;
            if (!admin) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);

            const { jobId } = req.params;

            await this._adminJobService.deleteJob(jobId);

            return ApiResponse.success(res, ADMIN_JOB_MESSAGES.DELETED, null);
        } catch (error) {
            next(error);
        }
    }
}
