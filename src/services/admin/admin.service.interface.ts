import { UsersPaginatedDTO } from "../../dtos/admin.dto";
import { UserProfileDTO } from "../../dtos/userProfile.dto";
import { ICompany } from "../../models/company/company.interface";
import { IUser } from "../../models/user/user.interface";

export interface IAdminService {
    getUsers(page: number, limit: number, search?: string): Promise<UsersPaginatedDTO<IUser>>;

    getUserById(userId: string): Promise<UserProfileDTO>;

    getCompanies(page: number, limit: number, search?: string): Promise<UsersPaginatedDTO<ICompany>>;

    getCompanyById(companyId: string): Promise<ICompany>;

    verifyCompany(companyId: string): Promise<ICompany>;

    rejectCompanyVerification(companyId: string, comment: string): Promise<void>;

    blockUser(id: string): Promise<IUser>;

    blockUserWithComment(userId: string, comment: string): Promise<UserProfileDTO>;

    unblockUser(id: string): Promise<IUser>;

    blockCompany(id: string): Promise<ICompany>;

    unblockCompany(id: string): Promise<ICompany>;

    getDocumentSignedUrl(documentKey: string): Promise<string>;
}
