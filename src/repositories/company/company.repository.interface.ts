import { CompanyVerificationStatus, ICompany } from "../../models/company/company.interface";
import { Types } from "mongoose";
import { IBaseRepository } from "../base-repository/base.repository.inteface";

export interface ICompanyRepository extends IBaseRepository<ICompany> {
    createCompany(company: Partial<ICompany>): Promise<ICompany>;
    findByEmailOrPhone(emailOrPhone: string): Promise<ICompany | null>;
    findByEmail(email: string): Promise<ICompany | null>;
    findOne(filter: Partial<ICompany>): Promise<ICompany | null>;
    updatePassword(userId: string | Types.ObjectId, hashedPassword: string): Promise<void>;
    findByGoogleId(googleId: string): Promise<ICompany | null>;
    findPaginated(page: number, limit: number, search?: string, verificationStatus?: string): Promise<[ICompany[], number]>;
    blockOrUnblock(id: string, flag: boolean): Promise<ICompany | null>;
}

export interface CompaniesSearchFilters {
    keyword?: string;
    verificationStatus?: CompanyVerificationStatus | string;
    isBlocked?: boolean;
}
