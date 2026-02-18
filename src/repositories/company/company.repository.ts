import { ICompany } from "../../models/company/company.interface";
import { BaseRepository } from "../base-repository/base.repository";
import { FilterQuery, Model } from "mongoose";
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

    async findPaginated(
        page: number,
        limit: number,
        search?: string,
        verificationStatus?: string,
    ): Promise<[ICompany[], number]> {
        page = Math.max(page, 1);
        limit = Math.min(Math.max(limit, 1), 50);

        const skip = (page - 1) * limit;

        const escapedSearch = search ? search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";

        const filter: FilterQuery<ICompany> = {
            role: "company",
        };
        if (escapedSearch) {
            filter.$or = [
                { email: { $regex: escapedSearch, $options: "i" } },
                { name: { $regex: escapedSearch, $options: "i" } },
            ];
        }

        if (verificationStatus) {
            console.log("verificationStatus in the repo", verificationStatus);
            filter.verificationStatus = verificationStatus;
        }

        const [companies, total] = await Promise.all([
            this.model.find(filter).lean().skip(skip).limit(limit),
            this.model.countDocuments(filter),
        ]);

        return [companies, total];
    }

    async blockOrUnblock(id: string, flag: boolean): Promise<ICompany | null> {
        try {
            return await super.findByIdAndUpdate(id, { isBlocked: flag });
        } catch {
            throw new DataBaseError("db error while block or unblock company");
        }
    }
}
