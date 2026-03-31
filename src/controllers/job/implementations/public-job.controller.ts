import { Request, Response, NextFunction } from "express";
import { IPublicJobService } from "../../../services/job/interfaces/public-job.service.interface";
import { IPublicJobController } from "../interfaces/public-job.controller.interface";
import { JobSearchFilters } from "../../../repositories/job/job.repository.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { COMPANY_JOB_MESSAGES } from "../../../constants/messages/company.messages.constants";

export class PublicJobController implements IPublicJobController {
    constructor(private _publicJobService: IPublicJobService) {}

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
}
