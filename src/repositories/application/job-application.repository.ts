import { FilterQuery, Model, PipelineStage, Types, UpdateQuery } from "mongoose";
import { IJobApplication } from "../../models/job-application/job-application.interface";
import { BaseRepository } from "../base-repository/base.repository";
import { CandidatesFilters, IJobApplicationRepository } from "./job-application.repository.interface";

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
        status?: string,
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
        filters?: { status?: string; jobId?: string },
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

    async getApplicantsList(
        companyId: string,
        page: number,
        limit: number,
        search: string,
        filters: CandidatesFilters,
    ): Promise<[IJobApplication[], number]> {
        console.log("filters in repository:", filters);
        const query: FilterQuery<IJobApplication> = {
            company: new Types.ObjectId(companyId),
        };

        // Status filter
        if (filters.status && filters.status.length > 0) {
            query.status = { $in: filters.status };
        }

        // Job filter
        if (filters.jobId) {
            query.job = filters.jobId;
        }

        // Date range filter
        if (filters.dateRange) {
            const dateFilter = this.getDateRangeFilter(filters.dateRange, filters.startDate, filters.endDate);
            if (dateFilter) {
                query.appliedAt = dateFilter;
            }
        }

        // Build aggregation pipeline
        const pipeline: PipelineStage[] = [
            { $match: query },
            {
                $lookup: {
                    from: "users",
                    localField: "applicant",
                    foreignField: "_id",
                    as: "applicantDetails",
                },
            },
            { $unwind: "$applicantDetails" },
            {
                $lookup: {
                    from: "jobs",
                    localField: "job",
                    foreignField: "_id",
                    as: "jobDetails",
                },
            },
            { $unwind: "$jobDetails" },
            {
                $lookup: {
                    from: "skills",
                    localField: "applicantDetails.skills",
                    foreignField: "_id",
                    as: "applicantSkills",
                },
            },
        ];

        // Skills filter
        if (filters.skills && filters.skills.length > 0) {
            pipeline.push({
                $match: {
                    "applicantSkills.name": { $in: filters.skills },
                },
            });
        }

        // Experience filter
        if (filters.experience && filters.experience.length > 0) {
            const experienceConditions = filters.experience.map((exp) => {
                return this.getExperienceCondition(exp);
            });
            pipeline.push({
                $match: {
                    $or: experienceConditions,
                },
            });
        }

        // Education filter
        if (filters.education && filters.education.length > 0) {
            pipeline.push({
                $match: {
                    "applicantDetails.education.type": { $in: filters.education },
                },
            });
        }

        // Availability filter
        if (filters.availability && filters.availability.length > 0) {
            const availabilityConditions = filters.availability.map((avail) => {
                return this.getAvailabilityCondition(avail);
            });
            pipeline.push({
                $match: {
                    $or: availabilityConditions,
                },
            });
        }

        // Search filter
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { "applicantDetails.firstName": { $regex: search, $options: "i" } },
                        { "applicantDetails.lastName": { $regex: search, $options: "i" } },
                        { "applicantDetails.email": { $regex: search, $options: "i" } },
                        { "applicantSkills.name": { $regex: search, $options: "i" } },
                        { "applicantDetails.education.institution": { $regex: search, $options: "i" } },
                        { "applicantDetails.experience.company": { $regex: search, $options: "i" } },
                    ],
                },
            });
        }

        // Add computed fields
        pipeline.push({
            $addFields: {
                candidateName: {
                    $concat: ["$applicantDetails.firstName", " ", "$applicantDetails.lastName"],
                },
                profilePicture: "$applicantDetails.profilePicture",
                experience: "$applicantDetails.totalExperienceYears",
                skills: "$applicantSkills",
                education: "$applicantDetails.education",
            },
        });

        console.log("Pipeline after skills filter:", JSON.stringify(pipeline, null, 2));
        // Count total
        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await this.model.aggregate(countPipeline);

        console.log("Count result:", countResult);
        const total = countResult[0]?.total || 0;

        // Add pagination
        pipeline.push({ $sort: { appliedAt: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit });

        const applications = await this.model.aggregate(pipeline);

        console.log("Applications result:", applications);

        return [applications, total];
    }

    private getDateRangeFilter(
        dateRange: string,
        startDate?: string,
        endDate?: string,
    ): { $gte?: Date; $lte?: Date } | null {
        const now = new Date();
        const filter: { $gte?: Date; $lte?: Date } = {};

        switch (dateRange) {
            case "today":
                filter.$gte = new Date(now.setHours(0, 0, 0, 0));
                filter.$lte = new Date(now.setHours(23, 59, 59, 999));
                break;
            case "last7days":
                filter.$gte = new Date(now.setDate(now.getDate() - 7));
                break;
            case "last30days":
                filter.$gte = new Date(now.setDate(now.getDate() - 30));
                break;
            case "custom":
                if (startDate) filter.$gte = new Date(startDate);
                if (endDate) filter.$lte = new Date(endDate);
                break;
            default:
                return null;
        }

        return Object.keys(filter).length > 0 ? filter : null;
    }

    private getExperienceCondition(experience: string): FilterQuery<IJobApplication> {
        switch (experience) {
            case "0-1":
                return { "applicantDetails.totalExperienceYears": { $gte: 0, $lt: 1 } };
            case "1-3":
                return { "applicantDetails.totalExperienceYears": { $gte: 1, $lt: 3 } };
            case "3-5":
                return { "applicantDetails.totalExperienceYears": { $gte: 3, $lt: 5 } };
            case "5+":
                return { "applicantDetails.totalExperienceYears": { $gte: 5 } };
            default:
                return {};
        }
    }

    private getAvailabilityCondition(availability: string): FilterQuery<IJobApplication> {
        const now = new Date();
        switch (availability) {
            case "immediate":
                return {
                    $or: [
                        { noticePeriod: { $lte: 0 } },
                        { availableFrom: { $lte: now } },
                        { noticePeriod: { $exists: false }, availableFrom: { $exists: false } },
                    ],
                };
            case "15days":
                return {
                    $or: [
                        { noticePeriod: { $gte: 1, $lte: 15 } },
                        {
                            availableFrom: {
                                $gte: now,
                                $lte: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
                            },
                        },
                    ],
                };
            case "30days":
                return {
                    $or: [
                        { noticePeriod: { $gte: 16, $lte: 30 } },
                        {
                            availableFrom: {
                                $gte: now,
                                $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
                            },
                        },
                    ],
                };
            case "60+":
                return {
                    $or: [
                        { noticePeriod: { $gt: 30 } },
                        {
                            availableFrom: {
                                $gt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
                            },
                        },
                    ],
                };
            default:
                return {};
        }
    }
}
