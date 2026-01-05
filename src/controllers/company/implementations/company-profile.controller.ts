import { Request, Response, NextFunction } from "express";
import { ICompanyProfileService } from "../../../services/company/interfaces/profile.service.interface";
import { ICompanyProfileController } from "../interfaces/company-profile.controller.interface";
import { AppError } from "../../../errors/app.error.";
import { CompanyProfileDTO } from "../../../dtos/companyProfile.dto";
import { ApiResponse } from "../../../utils/apiResponse.utils";

export class CompanyProfileController implements ICompanyProfileController {
    constructor(private _companyProfileService: ICompanyProfileService) {}

    async getProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) throw new AppError("User not found");

            const companyProfileData: CompanyProfileDTO = await this._companyProfileService.getProfile(user.id);

            return ApiResponse.success(res, "Company profile fetching successfull", companyProfileData);
        } catch (error) {
            next(error);
        }
    }

    async updateBasicProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AppError("User not found");

            const updatedProfile = await this._companyProfileService.updateBasicProfile(company.id, req.body);

            return ApiResponse.success(res, "Company profile updated successfully", updatedProfile);
        } catch (error) {
            next(error);
        }
    }

    async updateProfilePicture(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AppError("User not found");

            const profilePicture = req.file;
            if (!profilePicture) throw new AppError("File not found");
            console.log("reached here");
            const updatedProfile = await this._companyProfileService.updateProfilePicture(company.id, profilePicture);

            return ApiResponse.success(res, "Company profile picture updated successfully", updatedProfile);
        } catch (error) {
            next(error);
        }
    }

    async deleteProfilePicture(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AppError("User not found");

            const updatedProfile = await this._companyProfileService.deleteProfilePicture(company.id);

            return ApiResponse.success(res, "Company profile picture deleted successfully", updatedProfile);
        } catch (error) {
            next(error);
        }
    }

    async updateBannerImage(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AppError("User not found");

            const bannerImage = req.file;
            if (!bannerImage) throw new AppError("Banner image not found");
            const profile = await this._companyProfileService.updateBannerImage(company.id, bannerImage);
            return ApiResponse.success(res, "Company banner image updated successfully", profile);
        } catch (error) {
            next(error);
        }
    }

    async deleteBannerImage(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AppError("User not found");
            const profile = await this._companyProfileService.deleteBannerImage(company.id);
            return ApiResponse.success(res, "Company banner image deleted successfully", profile);
        } catch (error) {
            next(error);
        }
    }

    async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AppError("User not found");
            const document = req.file;
            if (!document) throw new AppError("Document not found");
            const profile = await this._companyProfileService.uploadDocument(company.id, document);
            return ApiResponse.success(res, "Document uploded successfully", profile);
        } catch (error) {
            next(error);
        }
    }

    async deleteDocument(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) throw new AppError("User not found");

            const documentKey = req.query.key;

            if (typeof documentKey !== "string") {
                throw new AppError("Invalid document key");
            }

            if (!documentKey) throw new AppError("Document key if not found");
            const profile = await this._companyProfileService.deleteDocument(company.id, documentKey);
            return ApiResponse.success(res, "Document deleted successfully", profile);
        } catch (error) {
            next(error);
        }
    }
}
