import { UsersPaginatedDTO } from "../../dtos/admin.dto";
import { ICompany } from "../../models/company/company.interface";
import { IUser } from "../../models/user/user.interface";

export interface IAdminService {
    getUsersPaginated(page: number, limit: number): Promise<UsersPaginatedDTO<IUser>>;
    getCompaniesPaginated(page: number, limit: number): Promise<UsersPaginatedDTO<ICompany>>;
    searchUsers(serachQuery: string): Promise<IUser[]>;
    searchCompanies(serachQuery: string): Promise<ICompany[]>;
    blockUser(id: string): Promise<IUser | null>;
    unblockUser(id: string): Promise<IUser | null>;
    blockCompany(id: string): Promise<ICompany | null>;
    unblockCompany(id: string): Promise<ICompany | null>;
}
