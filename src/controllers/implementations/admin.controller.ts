import { ICompanyRepository } from "../../repositories/company/company.repository.interface";
import { IUserRepository } from "../../repositories/user/user.repository.interface";
import { IAdminController } from "../interfaces/admin.controller.interface";
import { Request, Response } from "express";

export class AdminController implements IAdminController {
    constructor(private _userRepository: IUserRepository, private _companyRepository: ICompanyRepository) {}
    async getCompaniesPaginated(req: Request, res: Response): Promise<Response | void> {
        try {
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);

            const { data, total } = await this._companyRepository.findPaginated(page, limit);
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

            const { data, total } = await this._userRepository.findPaginated(page, limit);
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

            const users = await this._userRepository.findUsers(search);
            return res.json({
                success: true,
                message: "users fetch successfull",
                users,
            });
        } catch (error) {

            console.log(error)
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }


    async getCompanies(req: Request, res: Response): Promise<Response | void> {
        try {
            const search = req.query.search as string;

            const companies = await this._companyRepository.findCompanies(search);
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

            const user = await this._userRepository.blockOrUnblock(id, true);

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

            const user = await this._userRepository.blockOrUnblock(id, false);

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

            const user = await this._companyRepository.blockOrUnblock(id, true);

            return res.json({
                success: true,
                message: "company blocked successfull",
                user,
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }
    async unblockCompany(req: Request, res: Response): Promise<Response | void> {
        try {
            const id = req.params.id as string;

            const user = await this._companyRepository.blockOrUnblock(id, false);

            return res.json({
                success: true,
                message: "company unblocked successfully",
                user,
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }
}
