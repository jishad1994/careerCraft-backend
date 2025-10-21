import { AuthResponseUserDTO } from "../../../dtos/auth.dto";
import { toAuthUserResponseDTO } from "../../../mappers/user.mapper";
import { IAdminService } from "../../../services/admin/admin.service.interface";
import { IAdminController } from "../interfaces/admin.controller.interface";
import { Request, Response } from "express";

export class AdminController implements IAdminController {
    constructor(private _adminService: IAdminService) {}
    async getCompaniesPaginated(req: Request, res: Response): Promise<Response | void> {
        try {
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);

            const { data, total } = await this._adminService.getCompaniesPaginated(page, limit);
            return res.json({
                success: true,
                message: "companies fetch successfull",
                data,
                pagination: { total, page, limit },
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }

    async getUsersPaginated(req: Request, res: Response): Promise<Response | void> {
        try {
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);

            const { data, total } = await this._adminService.getUsersPaginated(page, limit);
            return res.json({
                success: true,
                message: "users fetch successfull",
                data,
                pagination: { total, page, limit },
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }

    async getUsers(req: Request, res: Response): Promise<Response | void> {
        try {
            const search = req.query.search as string;

            const users = await this._adminService.searchUsers(search);
            return res.json({
                success: true,
                message: "users fetch successfull",
                users,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }

    async getCompanies(req: Request, res: Response): Promise<Response | void> {
        try {
            const search = req.query.search as string;

            const companies = await this._adminService.searchCompanies(search);
            return res.json({
                success: true,
                message: "companies fetch successfull",
                companies,
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }

    async blockUser(req: Request, res: Response): Promise<Response | void> {
        try {
            const id = req.params.id as string;

            const rawUser = await this._adminService.blockUser(id);
            let user: AuthResponseUserDTO;
            if (rawUser) {
                user = toAuthUserResponseDTO(rawUser);
            } else {
                throw new Error("User not found");
            }
            return res.json({
                success: true,
                message: "users blocked successfull",
                user,
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }
    async unblockUser(req: Request, res: Response): Promise<Response | void> {
        try {
            const id = req.params.id as string;

            const rawUser = await this._adminService.unblockUser(id);

            let user: AuthResponseUserDTO;
            if (rawUser) {
                user = toAuthUserResponseDTO(rawUser);
            } else {
                throw new Error("User not found");
            }
            return res.json({
                success: true,
                message: "user unblocked successfully",
                user,
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }
    async blockCompany(req: Request, res: Response): Promise<Response | void> {
        try {
            const id = req.params.id as string;

            const rawCompany = await this._adminService.blockCompany(id);
            let company: AuthResponseUserDTO;
            if (rawCompany) {
                company = toAuthUserResponseDTO(rawCompany);
            } else {
                throw new Error("company not found");
            }
            return res.json({
                success: true,
                message: "company blocked successfull",
                company,
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }
    async unblockCompany(req: Request, res: Response): Promise<Response | void> {
        try {
            const id = req.params.id as string;

            const rawCompany = await this._adminService.unblockCompany(id);
            let company: AuthResponseUserDTO;
            if (rawCompany) {
                company = toAuthUserResponseDTO(rawCompany);
            } else {
                throw new Error("company not found");
            }
            return res.json({
                success: true,
                message: "company unblocked successfull",
                company,
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }
}
