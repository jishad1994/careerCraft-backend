import { Request, Response, NextFunction } from "express";
import { IAdminStatsService } from "../../../services/admin/admin-stats/admin-stats.service.interface";
import { HTTP_MESSAGES } from "../../../constants/messages/http.messages.constants";
import { AuthError } from "../../../errors-classes/auth.error";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { IAdminStatsController } from "../interfaces/admin-stats.controller.interface";

export class AdminStatsController implements IAdminStatsController {
    constructor(private readonly _statsService: IAdminStatsService) {}

    async getStats(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            if (!req.user) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);
            const stats = await this._statsService.getStats();
            return ApiResponse.success(res, "Stats fetched successfully", stats);
        } catch (error) {
            next(error);
        }
    }
}