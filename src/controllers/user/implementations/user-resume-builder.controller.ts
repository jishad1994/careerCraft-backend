import { Request, Response, NextFunction } from "express";
import { IResumeBuilderService } from "../../../services/user/interfaces/resume.service.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { AuthError } from "../../../errors-classes/auth.error";
import { AppError } from "../../../errors-classes/app.error.";
import { HTTP_MESSAGES } from "../../../constants/messages/http.messages.constants";
import { IResumeData } from "../../../models/resume/resume.interface";
import { IResumeBuilderController } from "../interfaces/resume-builder.controller.interface";

export class ResumeBuilderController implements IResumeBuilderController {
    constructor(private readonly resumeBuilderService: IResumeBuilderService) {}

    // ---- Helper ----
    private getUserId(req: Request): string {
        const userId = req.user?.id;
        if (!userId) {
            throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);
        }
        return userId;
    }

    // ---- Templates ----
    async getTemplates(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const templates = this.resumeBuilderService.getTemplates();
            return ApiResponse.success(res, "Templates fetched successfully", templates);
        } catch (error) {
            next(error);
        }
    }

    // ---- Get Draft ----
    async getDraft(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);
            }

            const draft = await this.resumeBuilderService.getSavedDraft(userId);

            return ApiResponse.success(res, "Draft fetched successfully", draft);
        } catch (error) {
            next(error);
        }
    }

    // ---- Save Draft ----
    async saveDraft(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = this.getUserId(req);
            const resumeData: IResumeData = req.body.resumeData;

            if (!resumeData) {
                throw new AppError("Resume data is required");
            }

            const saved = await this.resumeBuilderService.saveDraft(userId, resumeData);

            return ApiResponse.success(res, "Draft saved successfully", saved);
        } catch (error) {
            next(error);
        }
    }

    // ---- Profile Data ----
    async getProfileData(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = this.getUserId(req);

            const profileData = await this.resumeBuilderService.getProfileData(userId);

            return ApiResponse.success(res, "Profile data fetched successfully", profileData);
        } catch (error) {
            next(error);
        }
    }

    // ---- Generate PDF ----
    async generatePdf(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const resumeData: IResumeData = req.body.resumeData;

            if (!resumeData) {
                throw new AppError("Resume data is required");
            }

            const pdfBuffer = await this.resumeBuilderService.generatePdf(resumeData);

            const fileName = `${resumeData.personalInfo.fullName.replace(/[^a-zA-Z0-9]/g, "_")}_Resume.pdf`;

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
            res.setHeader("Content-Length", pdfBuffer.length.toString());

            return res.send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    }

    // ---- Upload Resume ----
    async uploadResume(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = this.getUserId(req);
            const resumeData: IResumeData = req.body.resumeData;

            if (!resumeData) {
                throw new AppError("Resume data is required");
            }

            const result = await this.resumeBuilderService.generateAndUpload(resumeData, userId);

            return ApiResponse.success(res, "Resume uploaded successfully", result);
        } catch (error) {
            next(error);
        }
    }
}
