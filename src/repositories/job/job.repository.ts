import { FilterQuery, Model } from "mongoose";
import { IJob } from "../../models/job/job.interface";
import { BaseRepository } from "../base-repository/base.repository";
import { IJobRepository, JobSearchFilters } from "./job.repository.interface";
export class JobRepository extends BaseRepository<IJob> implements IJobRepository {
    constructor(model: Model<IJob>) {
        super(model);
    }

    async findBySlug(slug: string): Promise<IJob | null> {
        return await this.model
            .findOne({ slug })
            .populate("company", "name email location")
            .populate("skills", "name")
          
    }

    async findByCompany(
        companyId: string,
        page: number,
        limit: number,
        filters: JobSearchFilters
    ): Promise<[IJob[], number]> {
        const skip = (page - 1) * limit;
        const query: FilterQuery<IJob> = {
            company: companyId,
        };

        if (filters.keyword) {
            query.$or = [
                { title: { $regex: filters.keyword, $options: "i" } },
                { description: { $regex: filters.keyword, $options: "i" } },
            ];
        }

        if (filters.location) {
            query["location.city"] = { $regex: filters.location, $options: "i" };
        }

        if (filters.employmentType) {
            query.employmentType = filters.employmentType;
        }

        if (filters.workMode) {
            query.workMode = filters.workMode;
        }

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.isVerified !== undefined) {
            query.isVerified = filters.isVerified;
        }

        const [jobs, total] = await Promise.all([
            this.model
                .find(query)
                .populate("company", "name email location")
                .populate("skills", "name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
            ,
            this.model.countDocuments(query),
        ]);

        return [jobs, total];
    }

    async updateById(id: string, updates: Partial<IJob>): Promise<IJob | null> {
        return await this.model
            .findByIdAndUpdate(id, updates, {
                new: true,
                runValidators: true,
            })
            .populate("company", "name email")
            .populate("skills", "name")
            
    }

    async softDelete(id: string): Promise<boolean> {
        const result = await this.model.findByIdAndUpdate(id, { status: "closed" }, { new: true });
        return !!result;
    }

    async search(filters: JobSearchFilters, page: number, limit: number): Promise<[IJob[], number]> {
        const skip = (page - 1) * limit;
        const query: FilterQuery<IJob> = {};

        if (filters.keyword) {
            query.$text = { $search: filters.keyword };
        }

        if (filters.location) {
            query.$or = [
                { "location.city": { $regex: filters.location, $options: "i" } },

                { "location.country": { $regex: filters.location, $options: "i" } },
            ];
        }

        if (filters.employmentType) {
            query.employmentType = filters.employmentType;
        }

        if (filters.workMode) {
            query.workMode = filters.workMode;
        }

        if (filters.minSalary || filters.maxSalary) {
            query["salary.min"] = {};
            if (filters.minSalary) {
                query["salary.min"].$gte = filters.minSalary;
            }
            if (filters.maxSalary) {
                query["salary.max"].$lte = filters.maxSalary;
            }
        }

        if (filters.experienceMin !== undefined) {
            query["experience.min"] = { $lte: filters.experienceMin };
        }
        if (filters.experienceMax !== undefined) {
            query["experience.max"] = { $gte: filters.experienceMax };
        }

        if (filters.skills && filters.skills.length > 0) {
            query.skills = { $in: filters.skills };
        }

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.isVerified !== undefined) {
            query.isVerified = filters.isVerified;
        }

        const [jobs, total] = await Promise.all([
            this.model
                .find(query)
                .populate("company", "name email location")
                .populate("skills", "name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                ,
            this.model.countDocuments(query),
        ]);

        return [jobs, total];
    }

    async findAllJobs(page: number, limit: number, filters: FilterQuery<IJob> = {}): Promise<[IJob[], number]> {
        const skip = (page - 1) * limit;
        const query = filters || {};

        const [jobs, total] = await Promise.all([
            this.model
                .find(query)
                .populate("company", "name email")
                .populate("skills", "name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                ,
            this.model.countDocuments(query as FilterQuery<IJob>),
        ]);

        return [jobs, total];
    }

    async incrementViews(id: string): Promise<void> {
        await this.model.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });
    }

    async incrementApplications(id: string): Promise<void> {
        await this.model.findByIdAndUpdate(id, { $inc: { applicationsCount: 1 } });
    }
}
