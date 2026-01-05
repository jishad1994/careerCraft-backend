import { UsersPaginatedDTO } from "../../dtos/admin.dto";
import { ICompanyRepository } from "../../repositories/company/company.repository.interface";
import { IUserRepository } from "../../repositories/user/user.repository.interface";
import { IAdminService } from "./admin.service.interface";
import { IUser } from "../../models/user/user.interface";
import { ICompany } from "../../models/company/company.interface";
import { PaginationMeta } from "../../utils/apiResponse.utils";

export class AdminService implements IAdminService {
    constructor(private _userRepository: IUserRepository, private _companyRepository: ICompanyRepository) {}

    async getUsers(page: number, limit: number, search?: string): Promise<UsersPaginatedDTO<IUser>> {
        if (!page || !limit) {
            throw new Error("page/limit constraints not provided");
        }

        const [data, total] = await this._userRepository.findPaginated(page, limit, search);

        const totalPages = Math.ceil(total / limit);

        const paginationMeta: PaginationMeta = {
            page,
            limit,
            totalItems: total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };
        return { data, paginationMeta };
    }

    async getCompanies(page: number, limit: number, search?: string): Promise<UsersPaginatedDTO<ICompany>> {
        if (!page || !limit) {
            throw new Error("page/limit constraints not provided");
        }

        const [data, total] = await this._companyRepository.findPaginated(page, limit, search);

        const totalPages = Math.ceil(total / limit);

        const paginationMeta: PaginationMeta = {
            page,
            limit,
            totalItems: total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };

        return { data, paginationMeta };
    }

    async blockUser(id: string) {
        if (!id) {
            throw new Error("user credential(id) is missing");
        }
        const updatedUser = await this._userRepository.blockOrUnblock(id, true);

        return updatedUser;
    }
    async unblockUser(id: string) {
        if (!id) {
            throw new Error("user credential(id) is missing");
        }
        const updatedUser = await this._userRepository.blockOrUnblock(id, false);
        return updatedUser;
    }

    async blockCompany(id: string) {
        if (!id) {
            throw new Error("user credential(id) is missing");
        }
        const updatedCompany = await this._companyRepository.blockOrUnblock(id, true);

        return updatedCompany;
    }
    async unblockCompany(id: string) {
        if (!id) {
            throw new Error("user credential(id) is missing");
        }
        const updatedCompany = await this._companyRepository.blockOrUnblock(id, false);

        return updatedCompany;
    }
}
