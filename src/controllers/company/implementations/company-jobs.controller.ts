import { Request, Response, NextFunction } from "express";
import { ICompanyJobController } from "../interfaces/company-jobs.controller.interface";
import { AppError } from "../../../errors/app.error.";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { ICompanyJobService } from "../../../services/job/interfaces/company-job.service.interface";
import { AuthError } from "../../../errors/auth.error";

export class CompanyJobController implements ICompanyJobController {
    constructor(private _companyJobService: ICompanyJobService) {}

    async createJob(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AuthError("Unauthorized");

            const jobData = req.body;

            if (!jobData.title || !jobData.description || !jobData.location) {
                throw new AppError("Missing required fields");
            }

            const job = await this._companyJobService.createJob(company.id, jobData);

            return ApiResponse.created(res, "Job created successfully", job);
        } catch (error) {
            next(error);
        }
    }

    async getCompanyJobs(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;

            if (!company) throw new AuthError("Unauthorized");

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = req.query.search?.toString() ?? "";

            const { jobs, paginationMeta } = await this._companyJobService.getCompanyJobs(company.id, page, limit, search);

            return ApiResponse.success(res, "Jobs fetched successfully", jobs, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

    async getJobById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AuthError("Unauthorized");

            const { jobId } = req.params;

            const job = await this._companyJobService.getJobById(company.id, jobId);

            return ApiResponse.success(res, "Job fetched successfully", job);
        } catch (error) {
            next(error);
        }
    }

    async updateJob(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AuthError("Unauthorized");

            const { jobId } = req.params;

            const updates = req.body;

            const job = await this._companyJobService.updateJob(company.id, jobId, updates);

            return ApiResponse.success(res, "Job updated successfully", job);
        } catch (error) {
            next(error);
        }
    }

    async updateJobStatus(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AuthError("Unauthorized");

            const { jobId } = req.params;
            const { status } = req.body;

            if (!status) {
                throw new AppError("Status is required");
            }

            const job = await this._companyJobService.updateJobStatus(company.id, jobId, status);

            return ApiResponse.success(res, "Job status updated successfully", job);
        } catch (error) {
            next(error);
        }
    }

    async deleteJob(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AuthError("Unauthorized");

            const { jobId } = req.params;

            await this._companyJobService.deleteJob(company.id, jobId);

            return ApiResponse.success(res, "Job deleted successfully", null);
        } catch (error) {
            next(error);
        }
    }
}
