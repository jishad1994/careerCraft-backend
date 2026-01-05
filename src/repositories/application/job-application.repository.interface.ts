import { IJobApplication } from "../../models/job-application/job-application.interface";
import { IBaseRepository } from "../base-repository/base.repository.inteface";

export interface IJobApplicationRepository extends IBaseRepository<IJobApplication> {
    findByUserAndJob(userId: string, jobId: string): Promise<IJobApplication | null>;
}
