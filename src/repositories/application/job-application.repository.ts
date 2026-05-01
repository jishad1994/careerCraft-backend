import { FilterQuery, Model, PipelineStage, Types, UpdateQuery } from "mongoose";
import {
    IInterview,
    IJobApplication,
    IJobApplicationDetails,
} from "../../models/job-application/job-application.interface";
import { BaseRepository } from "../base-repository/base.repository";
import { CandidatesFilters, IJobApplicationRepository } from "./job-application.repository.interface";
import { InterviewFilter, InterviewMatch, InterviewWithPopulated } from "../../interfaces/interview.interface";

export class JobApplicationRepository extends BaseRepository<IJobApplication> implements IJobApplicationRepository {
    constructor(model: Model<IJobApplication>) {
        super(model);
    }

    async findApplicationDetailsById(applicationId: string): Promise<IJobApplicationDetails | null> {
        const query: FilterQuery<IJobApplication> = {
            _id: new Types.ObjectId(applicationId),
        };

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
            
            {

    $lookup: {
        from: "companies", 
        localField: "company",
        foreignField: "_id",
        as: "companyDetails",
    },
},
{ $unwind: "$companyDetails" },
        ];

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
                companyName:"$companyDetails.name"
            },
        });

        const application = await this.model.aggregate<IJobApplicationDetails>(pipeline);

        return application[0] || null;
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
                ,
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
                ,
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
                ,
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
            ;
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
    ): Promise<[IJobApplicationDetails[], number]> {
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
            query.job = new Types.ObjectId(filters.jobId);
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

        const total = countResult[0]?.total || 0;

        // Add pagination
        pipeline.push({ $sort: { appliedAt: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit });

        const applications = await this.model.aggregate(pipeline);

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

    // ... existing methods

    /**
     * Add interview to application
     */
    async addInterview(applicationId: string, interview: IInterview): Promise<IJobApplication | null> {
        return await this.model
            .findByIdAndUpdate(
                applicationId,
                {
                    $push: { interviews: interview },
                    lastUpdatedAt: new Date(),
                },
                { new: true, runValidators: true },
            )
            .populate("applicant")
            .populate("job")
            .populate("company")
            ;
    }

    /**
     * Update specific interview in application
     */
    async updateInterview(
        applicationId: string,
        interviewId: string,
        updateData: Partial<IInterview>,
    ): Promise<IJobApplication | null> {
        const updateFields: Record<string, unknown> = {};

        Object.keys(updateData).forEach((key) => {
            updateFields[`interviews.$.${key}`] = updateData[key as keyof IInterview];
        });

        return await this.model
            .findOneAndUpdate(
                {
                    _id: new Types.ObjectId(applicationId),
                    "interviews._id": new Types.ObjectId(interviewId),
                },
                {
                    $set: {
                        ...updateFields,
                        lastUpdatedAt: new Date(),
                    },
                },
                { new: true, runValidators: true },
            )
            .populate("applicant")
            .populate("job")
            .populate("company")
            
    }

    /**
     * Remove interview from application
     */
    async removeInterview(applicationId: string, interviewId: string, round: number): Promise<IJobApplication | null> {
        return await this.model
            .findByIdAndUpdate(
                applicationId,
                {
                    $pull: { interviews: { round, _id: new Types.ObjectId(interviewId) } },
                    lastUpdatedAt: new Date(),
                },
                { new: true },
            )
            .populate("applicant")
            .populate("job")
            .populate("company")
           
    }

    async findPopulatedInterviewById(interviewId: string): Promise<InterviewWithPopulated | null> {
        const pipeline: PipelineStage[] = [];

        // Step 1: Match application that contains this interview
        pipeline.push({
            $match: {
                "interviews._id": new Types.ObjectId(interviewId),
            },
        });

        // Step 2: Unwind interviews
        pipeline.push({
            $unwind: {
                path: "$interviews",
                preserveNullAndEmptyArrays: false,
            },
        });

        // Step 3: Match specific interview
        pipeline.push({
            $match: {
                "interviews._id": new Types.ObjectId(interviewId),
            },
        });

        // Step 4-6: Lookup context (same as buildInterviewPipeline)
        pipeline.push(
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
                    from: "companies",
                    localField: "company",
                    foreignField: "_id",
                    as: "companyDetails",
                },
            },
            { $unwind: "$companyDetails" },
            {
                $lookup: {
                    from: "users",
                    localField: "applicant",
                    foreignField: "_id",
                    as: "applicantDetails",
                },
            },
            { $unwind: "$applicantDetails" },
        );

        // Step 7: Project final structure
        pipeline.push({
            $project: {
                _id: "$interviews._id",
                interview: "$interviews",
                applicationId: "$_id",
                jobId: "$job",
                jobTitle: "$jobDetails.title",
                jobSlug: "$jobDetails.slug",
                companyId: "$company",
                companyName: "$companyDetails.name",
                applicantId: "$applicant",
                applicantName: {
                    $concat: ["$applicantDetails.firstName", " ", "$applicantDetails.lastName"],
                },
                applicantEmail: "$applicantDetails.email",
                applicantPhone: "$applicantDetails.phone",
                applicantProfilePicture: "$applicantDetails.profilePicture",
                applicationStatus: "$status",
                appliedAt: "$appliedAt",
            },
        });

        const result = await this.model.aggregate<InterviewWithPopulated>(pipeline);

        return result[0] || null;
    }

    async getInterviewsWithPopulated(
        filter: InterviewFilter,
        page: number = 1,
        limit: number = 10,
    ): Promise<[interviews: InterviewWithPopulated[], total: number]> {
        const pipeline = this.buildInterviewPipeline(filter);

        // Count total
        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await this.model.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        // Add pagination
        const skip = (page - 1) * limit;
        pipeline.push({ $sort: { "interview.scheduledAt": -1 } }, { $skip: skip }, { $limit: limit });

        const interviews = await this.model.aggregate<InterviewWithPopulated>(pipeline);

        return [interviews, total];
    }

    async getInterviewStats(filter: Partial<InterviewFilter>): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
        upcoming: number;
        past: number;
    }> {
        const pipeline = this.buildInterviewPipeline(filter);

        pipeline.push({
            $facet: {
                total: [{ $count: "count" }],
                byStatus: [{ $group: { _id: "$interview.status", count: { $sum: 1 } } }],
                byType: [{ $group: { _id: "$interview.type", count: { $sum: 1 } } }],
                upcoming: [{ $match: { "interview.scheduledAt": { $gte: new Date() } } }, { $count: "count" }],
                past: [{ $match: { "interview.scheduledAt": { $lt: new Date() } } }, { $count: "count" }],
            },
        });

        const result = await this.model.aggregate(pipeline);
        const stats = result[0];

        return {
            total: stats.total[0]?.count || 0,
            byStatus: this.arrayToRecord(stats.byStatus),
            byType: this.arrayToRecord(stats.byType),
            upcoming: stats.upcoming[0]?.count || 0,
            past: stats.past[0]?.count || 0,
        };
    }

    async getUpcomingInterviews(
        filter: Partial<InterviewFilter>,
        days: number = 7,
        page: number = 1,
        limit: number = 10,
    ): Promise<[interviews: InterviewWithPopulated[], total: number]> {
        const now = new Date();
        const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        const upcomingFilter: InterviewFilter = {
            ...filter,
            startDate: now,
            endDate: futureDate,
            status: ["scheduled", "rescheduled"],
        };

        return await this.getInterviewsWithPopulated(upcomingFilter, page, limit);
    }

    private buildInterviewPipeline(filter: InterviewFilter): PipelineStage[] {
        const pipeline: PipelineStage[] = [];

        // Step 1: Match applications
        const matchStage: Record<string, unknown> = {};

        if (filter.companyId) {
            matchStage.company = new Types.ObjectId(filter.companyId);
        }

        if (filter.jobId) {
            matchStage.job = new Types.ObjectId(filter.jobId);
        }
        if (filter.applicantId) {
            matchStage.applicant = new Types.ObjectId(filter.applicantId);
        }

        if (filter.applicationId) {
            matchStage._id = new Types.ObjectId(filter.applicationId);
        }

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        // Step 2: Unwind interviews
        pipeline.push({
            $unwind: {
                path: "$interviews",
                preserveNullAndEmptyArrays: false,
            },
        });

        // Step 3: Match interview filters
        const interviewMatch: InterviewMatch = {};

        if (filter.status && filter.status.length > 0) {
            interviewMatch["interviews.status"] = { $in: filter.status };
        }

        if (filter.type && filter.type.length > 0) {
            interviewMatch["interviews.type"] = { $in: filter.type };
        }

        if (filter.round) {
            interviewMatch["interviews.round"] = filter.round;
        }

        if (filter.startDate || filter.endDate) {
            interviewMatch["interviews.scheduledAt"] = {};
            if (filter.startDate) {
                interviewMatch["interviews.scheduledAt"].$gte = filter.startDate;
            }
            if (filter.endDate) {
                interviewMatch["interviews.scheduledAt"].$lte = filter.endDate;
            }
        }

        if (Object.keys(interviewMatch).length > 0) {
            pipeline.push({ $match: interviewMatch });
        }

        // Step 4: Lookup job details
        pipeline.push({
            $lookup: {
                from: "jobs",
                localField: "job",
                foreignField: "_id",
                as: "jobDetails",
            },
        });

        pipeline.push({ $unwind: "$jobDetails" });

        // Step 5: Lookup company details
        pipeline.push({
            $lookup: {
                from: "companies",
                localField: "company",
                foreignField: "_id",
                as: "companyDetails",
            },
        });

        pipeline.push({ $unwind: "$companyDetails" });

        // Step 6: Lookup applicant details
        pipeline.push({
            $lookup: {
                from: "users",
                localField: "applicant",
                foreignField: "_id",
                as: "applicantDetails",
            },
        });

        pipeline.push({ $unwind: "$applicantDetails" });

        // Step 7: Search filter
        if (filter.search) {
            if (filter.companyId) {
                pipeline.push({
                    $match: {
                        $or: [
                            { "applicantDetails.firstName": { $regex: filter.search, $options: "i" } },
                            { "applicantDetails.lastName": { $regex: filter.search, $options: "i" } },
                            { "applicantDetails.email": { $regex: filter.search, $options: "i" } },
                            { "jobDetails.title": { $regex: filter.search, $options: "i" } },
                        ],
                    },
                });
            } else if (filter.applicantId) {
                pipeline.push({
                    $match: {
                        $or: [
                            { "companyDetails.name": { $regex: filter.search, $options: "i" } },
                            { "companyDetails.email": { $regex: filter.search, $options: "i" } },
                            { "applicantDetails.email": { $regex: filter.search, $options: "i" } },
                            { "jobDetails.title": { $regex: filter.search, $options: "i" } },
                        ],
                    },
                });
            }
        }

        // Step 8: Project final structure
        pipeline.push({
            $project: {
                _id: "$interviews._id",
                interview: "$interviews",
                applicationId: "$_id",
                jobId: "$job",
                jobTitle: "$jobDetails.title",
                jobSlug: "$jobDetails.slug",
                companyId: "$company",
                companyName: "$companyDetails.name",
                companyEmail: "$companyDetails.email",
                companyPhone: "$companyDetails.phone",
                companyProfilePicture: "$companyDetails.profilePicture",
                applicantId: "$applicant",
                applicantName: {
                    $concat: ["$applicantDetails.firstName", " ", "$applicantDetails.lastName"],
                },
                applicantEmail: "$applicantDetails.email",
                applicantPhone: "$applicantDetails.phone",
                applicantProfilePicture: "$applicantDetails.profilePicture",
                applicationStatus: "$status",
                appliedAt: "$appliedAt",
            },
        });

        return pipeline;
    }

    private arrayToRecord(arr: Array<{ _id: string; count: number }>): Record<string, number> {
        return arr.reduce(
            (acc, item) => {
                acc[item._id] = item.count;
                return acc;
            },
            {} as Record<string, number>,
        );
    }
}
