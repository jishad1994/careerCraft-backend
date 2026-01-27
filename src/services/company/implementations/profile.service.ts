import mongoose from "mongoose";
import { CompanyProfileDTO } from "../../../dtos/companyProfile.dto";
import { AppError } from "../../../errors/app.error.";
import { toCompanyProfileDTO } from "../../../mappers/company.mapper";
import { ICompany, ICompanyPopulated } from "../../../models/company/company.interface";
import { ICompanyRepository } from "../../../repositories/company/company.repository.interface";
import { ICompanyProfileService } from "../interfaces/profile.service.interface";
import { ValidationError } from "../../../errors/validation.error";
import { IFileService } from "../../file-service/interfaces/file.service.interface";
import { IDocument } from "../../../models/user/user.interface";

export class CompanyProfileService implements ICompanyProfileService {
    constructor(
        private _companyRepository: ICompanyRepository,
        private _fileService: IFileService,
    ) {}

    async getProfile(companyId: string): Promise<CompanyProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid object id");
        }

        const companyPopulated = await this._companyRepository.findByIdWithPopulate<ICompanyPopulated>(companyId, [
            { path: "jobsPosted", select: "title" },
        ]);

        if (!companyPopulated) {
            throw new AppError("Company not found");
        }

        if (companyPopulated.isBlocked) throw new AppError("Company is blocked");

        if (companyPopulated.documents && companyPopulated.documents.length > 0) {
            const signedUrlPromises = companyPopulated.documents.map(async (document) => {
                document.signedURL = await this._fileService.generateSignedUrl(document.key);
            });

            await Promise.all(signedUrlPromises);
        }

        return toCompanyProfileDTO(companyPopulated);
    }

    async updateBasicProfile(companyId: string, profileData: Partial<ICompany>): Promise<CompanyProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid object id");
        }

        const company = await this._companyRepository.findByIdAndUpdate(companyId, profileData);

        if (!company) {
            throw new AppError("Company not found");
        }
        const companyPopulated = await this._companyRepository.findByIdWithPopulate<ICompanyPopulated>(companyId, []);

        if (!companyPopulated) throw new AppError("Company not found");

        if (companyPopulated.isBlocked) throw new AppError("Company is blocked");

        return toCompanyProfileDTO(companyPopulated);
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

        const populatedCompany = await this._companyRepository.findByIdWithPopulate<ICompanyPopulated>(companyId, []);
        if (!populatedCompany) {
            throw new AppError("Company not found after populate");
        }

        return toCompanyProfileDTO(populatedCompany);
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

        const populatedCompany = await this._companyRepository.findByIdWithPopulate<ICompanyPopulated>(companyId, []);
        if (!populatedCompany) {
            throw new AppError("company not found after populate");
        }

        return toCompanyProfileDTO(populatedCompany);
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

        const populatedCompany = await this._companyRepository.findByIdWithPopulate<ICompanyPopulated>(companyId, []);
        if (!populatedCompany) {
            throw new AppError("Company not found after populate");
        }

        return toCompanyProfileDTO(populatedCompany);
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

        const populatedCompany = await this._companyRepository.findByIdWithPopulate<ICompanyPopulated>(companyId, []);
        if (!populatedCompany) {
            throw new AppError("company not found after populate");
        }

        return toCompanyProfileDTO(populatedCompany);
    }

    async uploadDocument(companyId: string, document: Express.Multer.File): Promise<CompanyProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid company id");
        }

        const company = await this._companyRepository.findById(companyId);

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

        const populatedCompany = await this._companyRepository.findByIdWithPopulate<ICompanyPopulated>(companyId, []);

        if (!populatedCompany) {
            throw new AppError("company not found after populate");
        }
        return toCompanyProfileDTO(populatedCompany);
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

        const populated = await this._companyRepository.findByIdWithPopulate<ICompanyPopulated>(companyId, []);
        if (!populated) {
            throw new AppError("company not found after populate");
        }
        return toCompanyProfileDTO(populated);
    }
}
