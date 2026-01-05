import { AuthUserResponseDTO } from "../../../dtos/auth.dto";
import { toAuthUserResponseDTO } from "../../../mappers/base-user.mapper";
import { IAdminService } from "../../../services/admin/admin.service.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { IAdminController } from "../interfaces/admin.controller.interface";
import { NextFunction, Request, Response } from "express";

export class AdminController implements IAdminController {
    constructor(private _adminService: IAdminService) {}

    async getCompanies(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const page = Number(req.query.page as string) || 1;
            const limit = Number(req.query.limit as string) || 10;
            const search = (req.query.search as string) || "";

            const { data, paginationMeta } = await this._adminService.getCompanies(page, limit, search);

            return ApiResponse.success(res, "Companies fetch successfull", data, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

    async getUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const page = Number(req.query.page as string) || 1;

            const limit = Number(req.query.limit as string) || 10;

            const search = (req.query?.search as string) || "";

            const { data, paginationMeta } = await this._adminService.getUsers(page, limit, search);

            return ApiResponse.success(res, "Users fetch successfull", data, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

    async blockUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const id = req.params.id as string;

            const rawUser = await this._adminService.blockUser(id);
            let user: AuthUserResponseDTO;
            if (rawUser) {
                user = toAuthUserResponseDTO(rawUser);
            } else {
                throw new Error("User not found");
            }
            return ApiResponse.success(res, "User blocked successfully", user);
        } catch (error) {
            next(error);
        }
    }
    async unblockUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const id = req.params.id as string;

            const rawUser = await this._adminService.unblockUser(id);

            let user: AuthUserResponseDTO;
            if (rawUser) {
                user = toAuthUserResponseDTO(rawUser);
            } else {
                throw new Error("User not found");
            }
            return ApiResponse.success(res, "User unblocked successfully", user);
        } catch (error) {
            next(error);
        }
    }
    async blockCompany(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const id = req.params.id as string;

            const rawCompany = await this._adminService.blockCompany(id);
            let company: AuthUserResponseDTO;
            if (rawCompany) {
                company = toAuthUserResponseDTO(rawCompany);
            } else {
                throw new Error("company not found");
            }

            return ApiResponse.success(res, "Company blocked successfully", company);
        } catch (error) {
            next(error);
        }
    }
    async unblockCompany(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const id = req.params.id as string;

            const rawCompany = await this._adminService.unblockCompany(id);
            let company: AuthUserResponseDTO;
            if (rawCompany) {
                company = toAuthUserResponseDTO(rawCompany);
            } else {
                throw new Error("company not found");
            }
            return ApiResponse.success(res, "Company unblocked successfully", company);
        } catch (error) {
            next(error);
        }
    }
}
