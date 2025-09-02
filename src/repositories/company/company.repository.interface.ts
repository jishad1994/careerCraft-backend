import { ICompany } from "../../models/company/company.interface";

export interface ICompanyRepo {
    createCompany(company: Partial<ICompany>): Promise<Partial<ICompany>>;
    findByEmailOrPhone(emailOrPhone: string): Promise<ICompany | null>;
    findByEmail(email: string): Promise<ICompany | null>;
}
