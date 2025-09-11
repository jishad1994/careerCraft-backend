import { ICompany } from "../../models/company/company.interface";
import { BaseRepository } from "../base.repository";
import { Model } from "mongoose";
import {  ICompanyRepository } from "./company.repository.interface";

export class CompanyRepository extends BaseRepository<ICompany> implements ICompanyRepository {
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
