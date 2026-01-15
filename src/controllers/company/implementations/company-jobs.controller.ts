import { Request, Response, NextFunction } from "express";
import { ICompanyJobController } from "../interfaces/company-jobs.controller.interface";
import { AppError } from "../../../errors/app.error.";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { ICompanyJobService } from "../../../services/job/interfaces/company-job.service.interface";
import { AuthError } from "../../../errors/auth.error";
import { ISkillServivce } from "../../../services/skills/interfaces/skills.services.interfaces";
import { JobSearchFilters } from "../../../repositories/job/job.repository.interface";

export class CompanyJobController implements ICompanyJobController {
    constructor(private _companyJobService: ICompanyJobService, private _skillService: ISkillServivce) {}

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

    async searchSkills(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const query = String(req.query.query) || "";

            const [skills, paginationMeta] = await this._skillService.getSkillsPaginated(page, limit, query);

            return ApiResponse.success(res, "Skill fetch successfull", skills, 200, paginationMeta);
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
            const filters: JobSearchFilters = {
                keyword: req.query.keyword as string,
                location: req.query.location as string,
                employmentType: req.query.employmentType as string,
                workMode: req.query.workMode as string,
                status: req.query.status as string,
                minSalary: req.query.minSalary ? Number(req.query.minSalary) : undefined,
                maxSalary: req.query.maxSalary ? Number(req.query.maxSalary) : undefined,
                experienceMin: req.query.experienceMin ? Number(req.query.experienceMin) : undefined,
                experienceMax: req.query.experienceMax ? Number(req.query.experienceMax) : undefined,
                skills: req.query.skills ? (req.query.skills as string).split(",") : undefined,
            };

            const { jobs, paginationMeta } = await this._companyJobService.getCompanyJobs(company.id, page, limit, filters);

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

    async getJobStatistics(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AppError("User not found", 401);

            const { jobs } = await this._companyJobService.getCompanyJobs(company.id, 1, 1000, {});

            const statistics = {
                total: jobs.length,
                active: jobs.filter((j) => j.status === "active").length,
                draft: jobs.filter((j) => j.status === "draft").length,
                paused: jobs.filter((j) => j.status === "paused").length,
                closed: jobs.filter((j) => j.status === "closed").length,
                totalApplications: jobs.reduce((sum, j) => sum + (j.applicationsCount || 0), 0),
                totalViews: jobs.reduce((sum, j) => sum + (j.viewsCount || 0), 0),
                verified: jobs.filter((j) => j.isVerified).length,
            };

            return ApiResponse.success(res, "Job statistics fetched successfully", statistics);
        } catch (error) {
            next(error);
        }
    }
}
