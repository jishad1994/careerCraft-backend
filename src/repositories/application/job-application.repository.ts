import { Model } from "mongoose";
import { IJobApplication } from "../../models/job-application/job-application.interface";
import { BaseRepository } from "../base-repository/base.repository";
import { IJobApplicationRepository } from "./job-application.repository.interface";

export class JobApplicationRepository extends BaseRepository<IJobApplication> implements IJobApplicationRepository {
    constructor(model: Model<IJobApplication>) {
        super(model);
    }

    async findByUserAndJob(userId: string, jobId: string): Promise<IJobApplication | null> {
        return await this.model.findOne({ user: userId, job: jobId }).populate('user').populate('company');
    }
}
