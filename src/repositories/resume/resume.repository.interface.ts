import { IResume, IResumeData } from "../../models/resume/resume.interface";
import { IBaseRepository } from "../base-repository/base.repository.inteface";

export interface IResumeRepository extends IBaseRepository<IResume> {
    upsertByUserId(userId: string, data: IResumeData): Promise<IResume>;
    deleteByUserId(userId: string): Promise<boolean>;
    findByUserId(userId: string): Promise<IResume | null>
}
