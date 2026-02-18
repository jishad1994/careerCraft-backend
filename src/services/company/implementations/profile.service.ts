import mongoose from "mongoose";
import { CompanyProfileDTO } from "../../../dtos/companyProfile.dto";
import { AppError } from "../../../errors/app.error.";
import { COMPANY_VERIFICATION_STATUS, ICompany } from "../../../models/company/company.interface";
import { ICompanyRepository } from "../../../repositories/company/company.repository.interface";
import { ICompanyProfileService } from "../interfaces/profile.service.interface";
import { ValidationError } from "../../../errors/validation.error";
import { IFileService } from "../../file-service/interfaces/file.service.interface";
import { IDocument } from "../../../models/user/user.interface";
import { CompanyMapper } from "../../../mappers/company.mapper";

export class CompanyProfileService implements ICompanyProfileService {
    constructor(
        private _companyRepository: ICompanyRepository,
        private _fileService: IFileService,
    ) {}

    async reapplyForVerification(companyId: string): Promise<CompanyProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid company id");
        }

        const company = await this._companyRepository.findById(companyId);

        if (!company) {
            throw new AppError("Company profile not found");
        }

        if (company.verificationStatus === COMPANY_VERIFICATION_STATUS.APPROVED) {
            throw new AppError("Company is already verified");
        }

        if (company.verificationStatus === COMPANY_VERIFICATION_STATUS.PENDING) {
            throw new AppError("Verification request is already pending review");
        }

        // Validate profile completion (optional - you can add custom logic)
        if (company.profileCompletion < 80) {
            throw new AppError("Please complete at least 90% of your profile before applying for verification");
        }

        if (!company.documents || company.documents.length === 0) {
            throw new AppError("Please upload required documents before applying for verification");
        }

        company.verificationStatus = COMPANY_VERIFICATION_STATUS.PENDING;

        await company.save();

        return CompanyMapper.toCompanyProfileDTO(company);
    }

    async updateAddress(companyId: string, addressData: Partial<ICompany>): Promise<CompanyProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid company id");
        }

        const company = await this._companyRepository.findByIdAndUpdate(companyId, addressData);

        if (!company) {
            throw new AppError("Company not found");
        }

        if (company.isBlocked) throw new AppError("Company is blocked");

        return CompanyMapper.toCompanyProfileDTO(company);
    }

    async getProfile(companyId: string): Promise<CompanyProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid object id");
        }

        const company = await this._companyRepository.findByIdWithPopulate<ICompany>(companyId, [
            { path: "jobsPosted", select: "title" },
        ]);

        if (!company) {
            throw new AppError("Company not found");
        }

        if (company.isBlocked) throw new AppError("Company is blocked");

        if (company.documents && company.documents.length > 0) {
            const signedUrlPromises = company.documents.map(async (document) => {
                document.signedURL = await this._fileService.generateSignedUrl(document.key);
            });

            await Promise.all(signedUrlPromises);
        }

        return CompanyMapper.toCompanyProfileDTO(company);
    }

    async updateBasicProfile(companyId: string, profileData: Partial<ICompany>): Promise<CompanyProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid object id");
        }

        const company = await this._companyRepository.findByIdAndUpdate(companyId, profileData);

        if (!company) {
            throw new AppError("Company not found");
        }

        if (company.isBlocked) throw new AppError("Company is blocked");

        return CompanyMapper.toCompanyProfileDTO(company);
    }

    async updateProfilePicture(companyId: string, profilePicture: Express.Multer.File): Promise<CompanyProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid company id");
        }

        const company = await this._companyRepository.findById(companyId);

        if (!company) {
            throw new AppError("Company not found");
        }

        const { key, location } = await this._fileService.uploadProfilePicture(profilePicture, company.id);

        const oldProfilePictureKey = company.profilePicture?.key;

        company.profilePicture = { key, location };

        await company.save();

        if (oldProfilePictureKey) {
            try {
                await this._fileService.deleteFile(oldProfilePictureKey);

                console.log("old one deleted");
            } catch (err) {
                console.error("Failed to delete old profile picture:", err);
            }
        }

        return CompanyMapper.toCompanyProfileDTO(company);
    }

    async deleteProfilePicture(companyId: string): Promise<CompanyProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid company id");
        }

        const company = await this._companyRepository.findById(companyId);
        if (!company) {
            throw new AppError("Company not found");
        }

        const oldProfilePictureKey = company.profilePicture?.key;

        if (oldProfilePictureKey) {
            try {
                company.profilePicture = undefined;
                await company.save();
                await this._fileService.deleteFile(oldProfilePictureKey);

                console.log("old one deleted");
            } catch (err) {
                console.error("Failed to delete old profile picture:", err);
            }
        }

        return CompanyMapper.toCompanyProfileDTO(company);
    }

    async updateBannerImage(companyId: string, bannerImage: Express.Multer.File): Promise<CompanyProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid company id");
        }

        const company = await this._companyRepository.findById(companyId);

        if (!company) {
            throw new AppError("Company not found");
        }
        const { key, location } = await this._fileService.uploadBannerImage(bannerImage, companyId);

        const oldBannerImageKey = company.bannerImage?.key;

        company.bannerImage = { key, location };

        await company.save();

        if (oldBannerImageKey) {
            try {
                await this._fileService.deleteFile(oldBannerImageKey);

                console.log("old one deleted");
            } catch (err) {
                console.error("Failed to delete old banner image:", err);
            }
        }

        return CompanyMapper.toCompanyProfileDTO(company);
    }

    async deleteBannerImage(companyId: string): Promise<CompanyProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid company id");
        }

        const company = await this._companyRepository.findById(companyId);
        if (!company) {
            throw new AppError("Company not found");
        }

        const oldBannerImageKey = company.bannerImage?.key;

        if (oldBannerImageKey) {
            try {
                company.bannerImage = undefined;
                await company.save();
                await this._fileService.deleteFile(oldBannerImageKey);

                console.log("old one deleted");
            } catch (err) {
                console.error("Failed to delete old banner picture:", err);
            }
        }

        return CompanyMapper.toCompanyProfileDTO(company);
    }

    async uploadDocument(companyId: string, document: Express.Multer.File): Promise<CompanyProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid company id");
        }

        const company = await this._companyRepository.findById<ICompany>(companyId);
        if (!company) throw new AppError("Company not found");

        const key = await this._fileService.uplodaFile(document, "documents", companyId);

        const newDoc: IDocument = {
            originalName: document.originalname,
            key: key,
            mimeType: document.mimetype,
            size: document.size,
            uploadedAt: new Date(),
        };

        company.documents.push(newDoc);

        await company.save();

        return CompanyMapper.toCompanyProfileDTO(company);
    }

    async deleteDocument(companyId: string, documentKey: string): Promise<CompanyProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid company id");
        }

        const company = await this._companyRepository.findById(companyId);
        if (!company) throw new AppError("Company not found");

        company.documents = company.documents.filter((doc) => doc.key !== documentKey);

        await company.save();

        try {
            await this._fileService.deleteFile(documentKey);
        } catch (err) {
            console.error("Failed to delete document:", err);
        }

        return CompanyMapper.toCompanyProfileDTO(company);
    }
}
