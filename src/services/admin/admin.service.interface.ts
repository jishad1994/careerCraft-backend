import { UsersPaginatedDTO } from "../../dtos/admin.dto";
import { CompanyProfileDTO } from "../../dtos/companyProfile.dto";
import { UserProfileDTO } from "../../dtos/userProfile.dto";
import { CompanyRejectionCodes, ICompany, ICompanyListItem } from "../../models/company/company.interface";
import { IUser } from "../../models/user/user.interface";

export interface IAdminService {
    getUsers(page: number, limit: number, search?: string): Promise<UsersPaginatedDTO<IUser>>;

    getUserById(userId: string): Promise<UserProfileDTO>;

    getCompanies(
        page: number,
        limit: number,
        search?: string,
        verificationStatus?: string,
    ): Promise<UsersPaginatedDTO<ICompanyListItem>>;

    getCompanyById(companyId: string): Promise<CompanyProfileDTO>;

    verifyCompany(companyId: string): Promise<CompanyProfileDTO>;

    rejectCompanyVerification(companyId: string, code: CompanyRejectionCodes, description: string): Promise<void>;

    blockUser(id: string): Promise<IUser>;

    blockUserWithComment(userId: string, comment: string): Promise<UserProfileDTO>;

    unblockUser(id: string): Promise<IUser>;

    blockCompany(id: string): Promise<ICompany>;

    unblockCompany(id: string): Promise<ICompany>;

    getDocumentSignedUrl(documentKey: string): Promise<string>;
}
