import { Request, Response, NextFunction } from "express";
import { IUserJobApplicationController } from "../interfaces/user-job-application.controller.interface";
import { IUserJobApplicationService } from "../../../services/application/interfaces/user-job-application.service.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { AppError } from "../../../errors-classes/app.error.";

export class UserJobApplicationController implements IUserJobApplicationController {
    constructor(private _userApplicationService: IUserJobApplicationService) {}

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

            return ApiResponse.success(res, "Application fetched successfully", application);
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
                status
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


 



}
