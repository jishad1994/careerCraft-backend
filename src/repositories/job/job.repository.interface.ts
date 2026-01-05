import { FilterQuery } from "mongoose";
import { IJob } from "../../models/job/job.interface";
import { IBaseRepository } from "../base-repository/base.repository.inteface";

export interface IJobRepository extends IBaseRepository<IJob> {
    create(payload: Partial<IJob>): Promise<IJob>;

    findBySlug(slug: string): Promise<IJob | null>;

    // findPaginated(page: number, limit: number, search?: string): Promise<[IJob[], number]>;

    findByCompany(companyId: string, page: number, limit: number, search?: string): Promise<[IJob[], number]>;

    softDelete(id: string): Promise<boolean>;

    incrementViews(id: string): Promise<void>;

    incrementApplications(id: string): Promise<void>;

    search(filters: JobSearchFilters, page: number, limit: number): Promise<[IJob[], number]>;

    findAllJobs(page: number, limit: number, filters: FilterQuery<IJob>): Promise<[IJob[], number]>;

    updateById(id: string, updates: Partial<IJob>): Promise<IJob|null>;
}

export interface JobSearchFilters {
    keyword?: string;
    location?: string;
    employmentType?: string;
    workMode?: string;
    minSalary?: number;
    maxSalary?: number;
    experienceMin?: number;
    experienceMax?: number;
    skills?: string[];
    status?: string;
    isVerified?: boolean;
}
