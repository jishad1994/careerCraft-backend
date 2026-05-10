import { Request, Response, NextFunction } from "express";
import { IPublicJobService } from "../../../services/job/interfaces/public-job.service.interface";
import { IPublicJobController } from "../interfaces/public-job.controller.interface";
import { JobSearchFilters } from "../../../repositories/job/job.repository.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { COMPANY_JOB_MESSAGES } from "../../../constants/messages/company.messages.constants";
import { ValidationError } from "../../../errors-classes/validation.error";

export class PublicJobController implements IPublicJobController {
    constructor(private _publicJobService: IPublicJobService) {}

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

            const { jobs, paginationMeta } = await this._publicJobService.searchJobs(filters, page, limit);


            return ApiResponse.success(res, "Jobs fetched successfully", jobs, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

    async getActiveJobs(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const filters: JobSearchFilters = {
                location: req.query.location as string,
                employmentType: req.query.employmentType as string,
                workMode: req.query.workMode as string,
            };

            const { jobs, paginationMeta } = await this._publicJobService.getActiveJobs(page, limit, filters);

            return ApiResponse.success(res, COMPANY_JOB_MESSAGES.FETCH_SUCCESSFULL, jobs, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

    async getFeaturedJobs(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 6;

            const { jobs, paginationMeta } = await this._publicJobService.getFeaturedJobs(page, limit);

            return ApiResponse.success(
                res,
                COMPANY_JOB_MESSAGES.FEATURED_JOBS_FETCH_SUCCESSFULL,
                jobs,
                200,
                paginationMeta,
            );
        } catch (error) {
            next(error);
        }
    }

    async getJobById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { jobId } = req.params;
            if (!jobId || typeof jobId !== "string") {
                throw new ValidationError("Invalid jobId");
            }
            const job = await this._publicJobService.getJobById(jobId);

            return ApiResponse.success(res, "Job fetched successfully", job);
        } catch (error) {
            next(error);
        }
    }

    async getJobBySlug(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { slug } = req.params;
            if (!slug || typeof slug !== "string") {
                throw new ValidationError("Invalid slug");
            }
            const job = await this._publicJobService.getJobBySlug(slug);

            return ApiResponse.success(res, "Job fetched successfully", job);
        } catch (error) {
            next(error);
        }
    }
}
