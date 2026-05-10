import { Request, Response, NextFunction } from "express";
import { ICompanyProfileService } from "../../../services/company/interfaces/profile.service.interface";
import { ICompanyProfileController } from "../interfaces/company-profile.controller.interface";
import { AppError } from "../../../errors-classes/app.error.";
import { CompanyProfileDTO } from "../../../dtos/companyProfile.dto";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { AuthError } from "../../../errors-classes/auth.error";
import { HTTP_MESSAGES } from "../../../constants/messages/http.messages.constants";
import {
    COMPANY_DOCUMENT_MESSAGES,
    COMPANY_PROFILE_MESSAGES,
} from "../../../constants/messages/company.messages.constants";
import { ValidationError } from "../../../errors-classes/validation.error";
import { IAddress } from "../../../models/user/user.interface";
import { Readable } from "stream";

export class CompanyProfileController implements ICompanyProfileController {
    constructor(private _companyProfileService: ICompanyProfileService) {}

    async reapplyForVerification(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;

            if (!company) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);

            const updatedProfile = await this._companyProfileService.reapplyForVerification(company.id);

            return ApiResponse.success(res, COMPANY_PROFILE_MESSAGES.VERIFICATION_REAPPLIED, updatedProfile);
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;

            if (!company) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);

            const companyProfileData: CompanyProfileDTO = await this._companyProfileService.getProfile(company.id);

            return ApiResponse.success(res, COMPANY_PROFILE_MESSAGES.PROFILE_FETCH_SUCCESSFULL, companyProfileData);
        } catch (error) {
            next(error);
        }
    }

    async updateBasicProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;

            if (!company) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);

            const updatedProfile = await this._companyProfileService.updateBasicProfile(company.id, req.body);

            return ApiResponse.success(res, COMPANY_PROFILE_MESSAGES.PROFILE_UPDATED, updatedProfile);
        } catch (error) {
            next(error);
        }
    }
    async updateAddress(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;

            if (!company) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);

            const address: IAddress[] = req.body;

            const updatedProfile = await this._companyProfileService.updateAddress(company.id, { address });

            return ApiResponse.success(res, COMPANY_PROFILE_MESSAGES.ADDRESS_UPDATED, updatedProfile);
        } catch (error) {
            next(error);
        }
    }

    async updateProfilePicture(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;

            if (!company) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);

            const profilePicture = req.file;
            if (!profilePicture) throw new AppError("File not found");
            const updatedProfile = await this._companyProfileService.updateProfilePicture(company.id, profilePicture);

            return ApiResponse.success(res, COMPANY_PROFILE_MESSAGES.PRFILE_PICTURE_UPDATED, updatedProfile);
        } catch (error) {
            next(error);
        }
    }

    async deleteProfilePicture(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;

            if (!company) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);

            const updatedProfile = await this._companyProfileService.deleteProfilePicture(company.id);

            return ApiResponse.success(res, COMPANY_PROFILE_MESSAGES.PRFILE_PICTURE_DELETED, updatedProfile);
        } catch (error) {
            next(error);
        }
    }

    async updateBannerImage(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;

            if (!company) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);

            const bannerImage = req.file;
            if (!bannerImage) throw new ValidationError("Banner image not found");
            const profile = await this._companyProfileService.updateBannerImage(company.id, bannerImage);
            return ApiResponse.success(res, COMPANY_PROFILE_MESSAGES.BANNER_IMAGE_UPDATED, profile);
        } catch (error) {
            next(error);
        }
    }

    async deleteBannerImage(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);
            const profile = await this._companyProfileService.deleteBannerImage(company.id);
            return ApiResponse.success(res, COMPANY_PROFILE_MESSAGES.BANNER_IMAGE_DELETED, profile);
        } catch (error) {
            next(error);
        }
    }

    async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;

            if (!company) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);
            const document = req.file;
            if (!document) throw new AppError("Document not found");
            const profile = await this._companyProfileService.uploadDocument(company.id, document);
            return ApiResponse.success(res, COMPANY_PROFILE_MESSAGES.DOCUMENT_UPLOADED, profile);
        } catch (error) {
            next(error);
        }
    }

    async deleteDocument(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;

            if (!company) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED);

            const documentKey = req.query.key;

            if (typeof documentKey !== "string") {
                throw new AppError("Invalid document key");
            }

            if (!documentKey) throw new AppError("Document key if not found");
            const profile = await this._companyProfileService.deleteDocument(company.id, documentKey);
            return ApiResponse.success(res, COMPANY_PROFILE_MESSAGES.DOCUMENT_DELETED, profile);
        } catch (error) {
            next(error);
        }
    }
    async viewDocument(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;

            if (!company) throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401);

            const documentKey = req.query.key;

            const mode = (req.query.mode as string) || "view";

            if (typeof documentKey !== "string") throw new AppError(COMPANY_DOCUMENT_MESSAGES.INVALID_DOCUMENT_KEY);

            const documentStream = await this._companyProfileService.viewDocument(company.id, documentKey);

            res.setHeader("Content-Type", documentStream.ContentType || "application/pdf");
            if (mode === "download") {
                res.setHeader("Content-Disposition", `attachment; filename="document-${documentStream}.pdf"`);
            } else {
                res.setHeader("Content-Disposition", `inline; filename="document-${documentStream}.pdf"`);
            }
            (documentStream.Body as Readable).pipe(res);
        } catch (error) {
            next(error);
        }
    }
}
