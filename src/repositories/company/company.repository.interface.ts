import { ICompany } from "../../models/company/company.interface";
import { Types } from "mongoose";
export interface ICompanyRepository {
    createCompany(company: Partial<ICompany>): Promise<ICompany>;
    findByEmailOrPhone(emailOrPhone: string): Promise<ICompany | null>;
    findByEmail(email: string): Promise<Partial<ICompany> | null>;
    findById(id: string): Promise<ICompany | null>;
    findOne(filter: Partial<ICompany>): Promise<ICompany | null>;
    updatePassword(userId: string | Types.ObjectId, hashedPassword: string): Promise<void>;
    findByGoogleId(googleId: string): Promise<ICompany | null>;
}
