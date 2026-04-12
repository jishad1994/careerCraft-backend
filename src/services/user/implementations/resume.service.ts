

import { Types } from "mongoose";
import { IResumePDFService } from "../interfaces/resume.pdf.service.interface";
import { IUser } from "../../../models/user/user.interface";
import { getAllTemplates } from "../../../utils/resume.templates";
import { IProfileDataResponse, IResumeData, IResumeEducation, IResumeExperience, IResumeSkill, IResumeTemplate, ISavedResumeResponse } from "../../../models/resume/resume.interface";
import { IResumeRepository } from "../../../repositories/resume/resume.repository.interface";
import { AppError } from "../../../errors-classes/app.error.";
import { AuthError } from "../../../errors-classes/auth.error";
import { IResumeBuilderService } from "../interfaces/resume.service.interface";
import { IUserRepository } from "../../../repositories/user/user.repository.interface";
import { IFileService } from "../../file-service/interfaces/file.service.interface";


export class ResumeBuilderService implements IResumeBuilderService{
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly resumeRepository: IResumeRepository,
        private readonly pdfService: IResumePDFService,
        private readonly fileUploadService: IFileService
    ) {}

    // ---- Templates ----

    getTemplates(): IResumeTemplate[] {
        return getAllTemplates();
    }

    // ---- Save draft (auto-save from frontend) ----

    async saveDraft(
        userId: string,
        resumeData: IResumeData
    ): Promise<ISavedResumeResponse> {
        const resume = await this.resumeRepository.upsertByUserId(
            userId,
            resumeData
        );

        return {
            personalInfo: resume.personalInfo,
            summary: resume.summary,
            experience: resume.experience,
            education: resume.education,
            skills: resume.skills,
            templateId: resume.templateId,
            lastSavedAt: resume.lastSavedAt,
        };
    }

    // ---- Load saved draft ----

    async getSavedDraft(
        userId: string
    ): Promise<ISavedResumeResponse | null> {
        const resume = await this.resumeRepository.findByUserId(userId);

        if (!resume) {
            return null;
        }

        return {
            personalInfo: resume.personalInfo,
            summary: resume.summary,
            experience: resume.experience,
            education: resume.education,
            skills: resume.skills,
            templateId: resume.templateId,
            lastSavedAt: resume.lastSavedAt,
        };
    }

    // ---- Profile data for pre-fill ----

    async getProfileData(userId: string): Promise<IProfileDataResponse> {
        const user = await this.userRepository.findByIdWithPopulate<IUser>(
            userId,
            [{ path: "skills", select: "name" }]
        );

        if (!user) {
            throw new AuthError("User not found");
        }

        return this.mapUserToProfileData(user);
    }

    // ---- Generate PDF ----

    async generatePdf(resumeData: IResumeData): Promise<Buffer> {
        this.validateResumeData(resumeData);
        return this.pdfService.generatePdf(resumeData);
    }

    // ---- Generate + Upload to S3 and attach to user profile ----

    async generateAndUpload(
        resumeData: IResumeData,
        userId: string
    ): Promise<{ documentKey: string; signedURL?: string }> {
        this.validateResumeData(resumeData);

        const pdfBuffer = await this.pdfService.generatePdf(resumeData);

        const _timestamp = Date.now();
        const sanitizedName = resumeData.personalInfo.fullName
            .replace(/[^a-zA-Z0-9]/g, "_")
            .toLowerCase();

        const key = await this.fileUploadService.uploadBuffer(
            pdfBuffer,'resumes',sanitizedName,'application/pdf'
        );

        // Attach to user's resumeURL array
        const resumeDocument = {
            originalName: `${resumeData.personalInfo.fullName}_Resume.pdf`,
            key: key,
            size: pdfBuffer.length,
            mimeType: "application/pdf",
            // signedURL: uploadResult.signedURL,
            uploadedAt: new Date(),
        };

        await this.userRepository.findByIdAndUpdate(userId, {
            $push: { resumeURL: resumeDocument },
        } as Partial<IUser>);

        return {
            documentKey: key,
            // signedURL: uploadResult.signedURL,
        };
    }

    // ---- Private helpers ----

    private mapUserToProfileData(user: IUser): IProfileDataResponse {
        const experience: IResumeExperience[] = (user.experience ?? []).map(
            (exp) => ({
                jobTitle: exp.jobTitle,
                company: exp.company,
                startDate: exp.startDate
                    ? new Date(exp.startDate).toISOString()
                    : "",
                endDate: exp.endDate
                    ? new Date(exp.endDate).toISOString()
                    : undefined,
                isCurrent: exp.isCurrent ?? false,
                description: exp.description ?? "",
                achievements: [],
            })
        );

        const education: IResumeEducation[] = (user.education ?? []).map(
            (edu) => ({
                degree: edu.type,
                institution: edu.institution,
                fieldOfStudy: edu.fieldOfStudy,
                startDate: edu.startDate
                    ? new Date(edu.startDate).toISOString()
                    : "",
                endDate: edu.endDate
                    ? new Date(edu.endDate).toISOString()
                    : undefined,
                isCurrent: edu.isCurrent ?? false,
                grade: edu.grade,
            })
        );

        const skills: IResumeSkill[] = (
            user.skills as unknown as Array<{
                _id: Types.ObjectId;
                name: string;
            }>
        ).map((s) => ({
            name: s.name,
        }));

        return {
            personalInfo: {
                fullName: `${user.firstName} ${user.lastName}`.trim(),
                email: user.email,
                phone: user.phone ?? "",
                location: user.location ?? "",
            },
            summary: {
                text: user.about ?? "",
            },
            experience,
            education,
            skills,
        };
    }

    private validateResumeData(data: IResumeData): void {
        if (!data.personalInfo?.fullName?.trim()) {
            throw new AppError("Full name is required");
        }
        if (!data.personalInfo?.email?.trim()) {
            throw new AppError("Email is required");
        }
        const validTemplates = ["classic", "modern", "minimal"];
        if (!validTemplates.includes(data.templateId)) {
            throw new AppError(
                `Invalid template. Choose from: ${validTemplates.join(", ")}`
            );
        }
    }
}