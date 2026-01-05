import { Request, Response, NextFunction } from "express";
import { IUserJobService } from "../../../services/job/interfaces/user-job.service.interface";
import { JobSearchFilters } from "../../../repositories/job/job.repository.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { AuthError } from "../../../errors/auth.error";
import { IUserJobController } from "../interfaces/user-job.controller.interface";

export class UserJobController implements IUserJobController {
    constructor(private _userJobService: IUserJobService) {}

    async searchJobs(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const filters: JobSearchFilters = {
                keyword: req.query.keyword as string,
                location: req.query.location as string,
                employmentType: req.query.employmentType as string,
                workMode: req.query.workMode as string,
                minSalary: req.query.minSalary ? Number(req.query.minSalary) : undefined,
                maxSalary: req.query.maxSalary ? Number(req.query.maxSalary) : undefined,
                experienceMin: req.query.experienceMin ? Number(req.query.experienceMin) : undefined,
                experienceMax: req.query.experienceMax ? Number(req.query.experienceMax) : undefined,
                skills: req.query.skills ? (req.query.skills as string).split(",") : undefined,
            };

            const { jobs, paginationMeta } = await this._userJobService.searchJobs(filters, page, limit);

            return ApiResponse.success(res, "Jobs fetched successfully", jobs, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

    async getJobById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { jobId } = req.params;

            const job = await this._userJobService.getJobById(jobId);

            return ApiResponse.success(res, "Job fetched successfully", job);
        } catch (error) {
            next(error);
        }
    }

    async getJobBySlug(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { slug } = req.params;

            const job = await this._userJobService.getJobBySlug(slug);

            return ApiResponse.success(res, "Job fetched successfully", job);
        } catch (error) {
            next(error);
        }
    }

    async applyForJob(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) throw new AuthError("Unauthorized");

            const { jobId } = req.params;

            const application = await this._userJobService.applyForJob(user.id, jobId);

            return ApiResponse.created(res, "Application submitted successfully", application);
        } catch (error) {
            next(error);
        }
    }
}
