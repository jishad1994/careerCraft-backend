import { Request, Response, NextFunction } from "express";
import { IUserJobService } from "../../../services/job/interfaces/user-job.service.interface";
import { JobSearchFilters } from "../../../repositories/job/job.repository.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { IUserJobController } from "../interfaces/user-job.controller.interface";
import { AppError } from "../../../errors-classes/app.error.";
import { ValidationError } from "../../../errors-classes/validation.error";

export class UserJobController implements IUserJobController {
    constructor(private _userJobService: IUserJobService) {}

    async searchJobs(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const filters: JobSearchFilters = {
                keyword: req.query.keyword as string,
                location: req.query.location as string,
                employmentType: req.query.employmentType as string,
                workMode: req.query.workMode as string,
                minSalary: req.query.minSalary ? Number(req.query.minSalary) : undefined,
                maxSalary: req.query.maxSalary ? Number(req.query.maxSalary) : undefined,
                experienceMin: req.query.experienceMin ? Number(req.query.experienceMin) : undefined,
                experienceMax: req.query.experienceMax ? Number(req.query.experienceMax) : undefined,
                skills: req.query.skills ? (req.query.skills as string).split(",") : undefined,
            };

            const { jobs, paginationMeta } = await this._userJobService.searchJobs(filters, page, limit);

            return ApiResponse.success(res, "Jobs fetched successfully", jobs, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

    async getJobById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { jobId } = req.params;
            if (!jobId || typeof jobId !== "string") {
                throw new ValidationError("Invalid jobId");
            }
            const job = await this._userJobService.getJobById(jobId);

            return ApiResponse.success(res, "Job fetched successfully", job);
        } catch (error) {
            next(error);
        }
    }

    async getJobBySlug(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { slug } = req.params;
            if (!slug || typeof slug !== "string") {
                throw new ValidationError("Invalid slug");
            }
            const job = await this._userJobService.getJobBySlug(slug);

            return ApiResponse.success(res, "Job fetched successfully", job);
        } catch (error) {
            next(error);
        }
    }

    async applyForJob(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) throw new AppError("User not found", 401);


            // const {
            //     job,
            //     originalName,
            //     key,
            //     coverLetterType,
            //     coverLetterText,
            //     expectedSalary,
            //     salaryCurrency,
            //     salaryPeriod,
            //     availableFrom,
            //     noticePeriod,
            //     portfolioUrl,
            //     linkedinUrl,
            //     githubUrl,
            // } = req.body;

            const jobData = req.body;
            jobData.applicant = user.id;

            if (jobData.coverLetterType === "document" && req.file) {
                const { key, signedUrl } = await this._userJobService.saveCoverLetter(req.file, user.id);
                jobData.coverLetter = {
                    type: jobData.coverLetterType,
                    fileName: req.file.filename,
                    fileUrl: signedUrl,
                    fileKey: key,
                    uploadedAt: Date.now(),
                };

                jobData.resume = {
                    fileName: jobData.resumeFileName,
                    fileKey: jobData.resumeFilekey,
                    uploadedAt: Date.now(),
                };
            } else if (jobData.coverLetterType === "text") {
                jobData.coverLetter = {
                    content: jobData.coverLetterText,
                    type: "text",
                    uploadedAt: Date.now(),
                };

                jobData.resume = {
                    fileName: jobData.resumeFileName,
                    fileKey: jobData.resumeFilekey,
                    uploadedAt: Date.now(),
                };
            }

            // if (!job || !key) {
            //     throw new AppError("Job ID and Resume ID are required", 400);
            // }

            // // Prepare application data
            // const applicationData: IJobApplication = {
            //     job,
            //     applicant: new Types.ObjectId(user.id),
            //     resume: {
            //         originalName,
            //         key,
            //     },
            // };

            // // Handle cover letter
            // if (coverLetterType === "text" && coverLetterText) {
            //     applicationData.coverLetter = {
            //         type: "text",
            //         content: coverLetterText,
            //     };
            // } else if (coverLetterType === "document" && req.file) {
            //     applicationData.coverLetter = {
            //         type: "document",
            //         file: req.file,
            //     };
            // }

            // // Handle expected salary
            // if (expectedSalary) {
            //     applicationData.expectedSalary = {
            //         amount: parseFloat(expectedSalary),
            //         currency: salaryCurrency || "INR",
            //         period: salaryPeriod || "monthly",
            //     };
            // }

            // // Handle other fields
            // if (availableFrom) {
            //     applicationData.availableFrom = new Date(availableFrom);
            // }
            // if (noticePeriod) {
            //     applicationData.noticePeriod = parseInt(noticePeriod);
            // }
            // if (portfolioUrl) {
            //     applicationData.portfolioUrl = portfolioUrl;
            // }
            // if (linkedinUrl) {
            //     applicationData.linkedinUrl = linkedinUrl;
            // }
            // if (githubUrl) {
            //     applicationData.githubUrl = githubUrl;
            // }

            const application = await this._userJobService.applyForJob(user.id, jobData);

            return ApiResponse.success(res, "Application submitted successfully", application, 201);
        } catch (error) {
            console.log(error instanceof Error ? error.message : "");

            next(error);
        }
    }
}
