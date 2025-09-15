import { ICompany } from "../../models/company/company.interface";
import { BaseRepository } from "../base.repository";
import { Model } from "mongoose";
import { ICompanyRepository } from "./company.repository.interface";

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

    async findPaginated(page: number, limit: number): Promise<{ data: ICompany[] | null; total: number }> {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.model.find({ role: "company" }, { name: 1, email: 1, role: 1, isBlocked: 1 }).skip(skip).limit(limit),
            this.model.countDocuments(),
        ]);
        return { data, total };
    }

    async blockOrUnblock(id: string, flag: boolean): Promise<ICompany | null> {
        return await super.findByIdAndUpdate(id, { isBlocked: flag });
    }

    async findCompanies(query: string): Promise<ICompany[]> {
        let companies = [];

        companies = await this.model
            .find(
                {
                    $or: [{ email: { $regex: query, $options: "i" } }, { name: { $regex: query, $options: "i" } }],
                },
                { name: 1, email: 1, role: 1 }
            )
            .lean();
        return companies;
    }
}
