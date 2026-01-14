import { AuthUserResponseDTO } from "../../../dtos/auth.dto";
import { toAuthUserResponseDTO } from "../../../mappers/base-user.mapper";
import { IAdminService } from "../../../services/admin/admin.service.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { IdParam } from "../../../validators-schemas/auth.schemas";
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

    async getCompanyById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { id } = req.params as unknown as IdParam;

            const company = await this._adminService.getCompanyById(id);

            return ApiResponse.success(res, "Company fetched successfully", company);
        } catch (error) {
            next(error);
        }
    }

    async verifyCompany(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { id } = req.params as unknown as IdParam;

            const company = await this._adminService.verifyCompany(id);

            return ApiResponse.success(res, "Company verified successfully", company);
        } catch (error) {
            next(error);
        }
    }

    async rejectCompanyVerification(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { id } = req.params as unknown as IdParam;
            const { comment } = req.body;

            await this._adminService.rejectCompanyVerification(id, comment);

            return ApiResponse.success(res, "Verification rejected and company notified");
        } catch (error) {
            next(error);
        }
    }

    async getDocumentSignedUrl(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { documentKey } = req.body;

            const url = await this._adminService.getDocumentSignedUrl(documentKey);

            return ApiResponse.success(res, "Signed URL generated", { url });
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

    async getUserById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { id } = req.params as unknown as IdParam;

            const user = await this._adminService.getUserById(id);

            return ApiResponse.success(res, "User fetched successfully", user);
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

    async blockUserWithComment(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { id } = req.params as unknown as IdParam;
            const { comment } = req.body;

            const user = await this._adminService.blockUserWithComment(id, comment);

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
