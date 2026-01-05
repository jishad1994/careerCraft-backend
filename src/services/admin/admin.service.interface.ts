import { UsersPaginatedDTO } from "../../dtos/admin.dto";
import { ICompany } from "../../models/company/company.interface";
import { IUser } from "../../models/user/user.interface";

export interface IAdminService {
    getUsers(page: number, limit: number, search?: string): Promise<UsersPaginatedDTO<IUser>>;
    getCompanies(page: number, limit: number, search?: string): Promise<UsersPaginatedDTO<ICompany>>;
    blockUser(id: string): Promise<IUser | null>;
    unblockUser(id: string): Promise<IUser | null>;
    blockCompany(id: string): Promise<ICompany | null>;
    unblockCompany(id: string): Promise<ICompany | null>;
}
