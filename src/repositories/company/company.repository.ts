import { ICompany } from "../../models/company/company.interface";
import { BaseRepository } from "../base.repository";
import { Model } from "mongoose";
import { MongoServerError } from "mongodb";
import { ICompanyRepository } from "./company.repository.interface";
import { DataBaseError } from "../../errors/database.error";
import { ConflictError } from "../../errors/conflict.error";

export class CompanyRepository extends BaseRepository<ICompany> implements ICompanyRepository {
    constructor(model: Model<ICompany>) {
        super(model);
    }

    async createCompany(company: Partial<ICompany>) {
        try {
            const doc = await super.create(company);
            return doc.toObject();
        } catch (error: unknown) {
            if (error instanceof MongoServerError) {
                if (error.code == 11000) {
                    throw new ConflictError("Duplicate entry: resource already exists", 409);
                }
            }
            throw new DataBaseError("Database error occured while creating user", 500);
        }
    }

    async findByEmailOrPhone(emailOrPhone: string): Promise<ICompany | null> {
        try {
            return await this.model.findOne({
                $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
            });
        } catch {
            throw new DataBaseError("database error occured while finding user email or phone");
        }
    }

    async findPaginated(page: number, limit: number): Promise<{ data: ICompany[]; total: number }> {
        try {
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                this.model.find({ role: "company" }, { name: 1, email: 1, role: 1, isBlocked: 1 }).skip(skip).limit(limit),
                this.model.countDocuments(),
            ]);
            return { data, total };
        } catch {
            throw new DataBaseError("databse error while finding paginated company");
        }
    }

    async blockOrUnblock(id: string, flag: boolean): Promise<ICompany | null> {
        try {
            return await super.findByIdAndUpdate(id, { isBlocked: flag });
        } catch {
            throw new DataBaseError("db error while block or unblock company");
        }
    }

    async findCompanies(query: string): Promise<ICompany[]> {
        try {
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
        } catch {
            throw new DataBaseError("db error while finding companies using query");
        }
    }
}
