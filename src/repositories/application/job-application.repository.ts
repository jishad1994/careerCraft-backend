import { FilterQuery, Model, UpdateQuery } from "mongoose";
import { IJobApplication } from "../../models/job-application/job-application.interface";
import { BaseRepository } from "../base-repository/base.repository";
import { IJobApplicationRepository } from "./job-application.repository.interface";

export class JobApplicationRepository extends BaseRepository<IJobApplication> implements IJobApplicationRepository {
    constructor(model: Model<IJobApplication>) {
        super(model);
    }

    async findByUserAndJob(userId: string, jobId: string): Promise<IJobApplication | null> {
        return await this.model.findOne({ applicant: userId, job: jobId }).populate("job").populate("company");
    }

    async findByApplicant(
        applicantId: string,
        page: number,
        limit: number,
        status?: string
    ): Promise<[IJobApplication[], number]> {
        const skip = (page - 1) * limit;
        const query: FilterQuery<IJobApplication> = {
            applicant: applicantId,
        };

        if (status) {
            query.status = status;
        }

        const [applications, total] = await Promise.all([
            this.model
                .find(query)
                .populate("company", "name email location")
                .populate("job", "title slug company location employmentType workMode status")
                .populate({
                    path: "job",
                    populate: {
                        path: "company",
                        select: "name email location",
                    },
                })
                .sort({ appliedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.model.countDocuments(query),
        ]);

        return [applications, total];
    }

    async findByCompany(
        companyId: string,
        page: number,
        limit: number,
        filters?: { status?: string; jobId?: string }
    ): Promise<[IJobApplication[], number]> {
        const skip = (page - 1) * limit;
        const query: FilterQuery<IJobApplication> = {
            company: companyId,
        };

        if (filters?.status) {
            query.status = filters.status;
        }

        if (filters?.jobId) {
            query.job = filters.jobId;
        }

        const [applications, total] = await Promise.all([
            this.model
                .find(query)
                .populate("applicant", "firstName lastName email phone profilePicture skills education experience")
                .populate("job", "title slug location employmentType workMode")
                .sort({ appliedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.model.countDocuments(query),
        ]);

        return [applications, total];
    }

    async findByJob(jobId: string, page: number, limit: number, status?: string): Promise<[IJobApplication[], number]> {
        const skip = (page - 1) * limit;
        const query: FilterQuery<IJobApplication> = {
            job: jobId,
        };

        if (status) {
            query.status = status;
        }

        const [applications, total] = await Promise.all([
            this.model
                .find(query)
                .populate("applicant", "firstName lastName email phone profilePicture skills education experience")
                .populate("company", "name email phone ")
                .populate("job", "title location")
                .sort({ appliedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.model.countDocuments(query),
        ]);

        return [applications, total];
    }

    async updateById(id: string, updates: UpdateQuery<IJobApplication>): Promise<IJobApplication | null> {
        return await this.model
            .findByIdAndUpdate(id, updates, {
                new: true,
                runValidators: true,
            })
            .populate("applicant", "name email phone profilePicture")
            .populate("job", "title slug company location")
            .lean();
    }

    async findById(id: string): Promise<IJobApplication | null> {
        return await this.model
            .findById(id)
            .populate("applicant", "firstName lastName email phone ")
            .populate("job", "title location slug company")
            .populate("company", "name email phone location")
            .lean();
    }

    async getApplicationStats(companyId: string): Promise<Array<{ status: string; count: number }>> {
        const stats = await this.model.aggregate([
            { $match: { company: companyId } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    status: "$_id",
                    count: 1,
                },
            },
        ]);

        return stats;
    }
}
