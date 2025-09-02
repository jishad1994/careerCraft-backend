import { ICompany } from "../../models/company/company.interface";
import { BaseRepo } from "../base.repository";
import { Model } from "mongoose";
import { ICompanyRepo } from "./company.repository.interface";

export class CompanyRepo extends BaseRepo<ICompany> implements ICompanyRepo {
    constructor(model: Model<ICompany>) {
        super(model);
    }

    async createCompany(company: Partial<ICompany>) {
        const doc = await super.create(company);
        return doc.toObject();
    }

    async findByEmailOrPhone(emailOrPhone: string): Promise<ICompany | null> {
        return await this.model.findOne({
            $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
        });
    }
}
