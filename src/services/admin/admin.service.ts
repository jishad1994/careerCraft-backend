import { UsersPaginatedDTO } from "../../dtos/admin.dto";
import { ICompanyRepository } from "../../repositories/company/company.repository.interface";
import { IUserRepository } from "../../repositories/user/user.repository.interface";
import { IAdminService } from "./admin.service.interface";
import { IUser } from "../../models/user/user.interface";
import { ICompany } from "../../models/company/company.interface";

export class AdminService implements IAdminService {
    constructor(private _userRepository: IUserRepository, private _companyRepository: ICompanyRepository) {}

    async getUsersPaginated(page: number, limit: number): Promise<UsersPaginatedDTO<IUser>> {
        if (!page || !limit) {
            throw new Error("page/limit constraints not provided");
        }

        const { data, total } = await this._userRepository.findPaginated(page, limit);

        return { data, total };
    }

    async getCompaniesPaginated(page: number, limit: number): Promise<UsersPaginatedDTO<ICompany>> {
        if (!page || !limit) {
            throw new Error("page/limit constraints not provided");
        }

        const { data, total } = await this._companyRepository.findPaginated(page, limit);

        return { data, total };
    }

    async searchUsers(searchQuery: string) {
        if (!searchQuery) {
            throw new Error("please enter a valid serach query");
        }

        const users = await this._userRepository.findUsers(searchQuery);

        return users;
    }
    async searchCompanies(searchQuery: string) {
        if (!searchQuery) {
            throw new Error("please enter a valid serach query");
        }

        const companies = await this._companyRepository.findCompanies(searchQuery);

        return companies;
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
