import { UsersPaginatedDTO } from "../../dtos/admin.dto";
import { ICompanyRepository } from "../../repositories/company/company.repository.interface";
import { IUserRepository } from "../../repositories/user/user.repository.interface";
import { IAdminService } from "./admin.service.interface";
import { IUser, IUserPopulated } from "../../models/user/user.interface";
import { CompanyRejectionCodes, ICompany, ICompanyListItem } from "../../models/company/company.interface";
import { PaginationMeta } from "../../utils/apiResponse.utils";
import { ValidationError } from "../../errors-classes/validation.error";
import mongoose from "mongoose";
import { AppError } from "../../errors-classes/app.error.";
import { IFileService } from "../file-service/interfaces/file.service.interface";
import { IEmailService } from "../email_service/email.service.interface";
import { toUserProfileDTO } from "../../mappers/user.mapper";
import { UserProfileDTO } from "../../dtos/userProfile.dto";
import { ICacheService } from "../cache/cache.service.interface";
import { CompanyVerificationHelper } from "../../service-helpers/company-verification.helper";
import { CompanyProfileDTO } from "../../dtos/companyProfile.dto";
import { CompanyMapper } from "../../mappers/company.mapper";

export class AdminService implements IAdminService {
    constructor(
        private _userRepository: IUserRepository,
        private _companyRepository: ICompanyRepository,
        private _emailService: IEmailService,
        private _fileService: IFileService,
        private _cacheService: ICacheService,
    ) {}

    async getUsers(page: number, limit: number, search?: string): Promise<UsersPaginatedDTO<IUser>> {
        if (!page || !limit) {
            throw new Error("page/limit constraints not provided");
        }

        const [data, total] = await this._userRepository.findPaginated(page, limit, search);

        const totalPages = Math.ceil(total / limit);

        const paginationMeta: PaginationMeta = {
            page,
            limit,
            totalItems: total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };
        return { data, paginationMeta };
    }

    async getCompanies(
        page: number,
        limit: number,
        search?: string,
        verificationStatus?: string,
    ): Promise<UsersPaginatedDTO<ICompanyListItem>> {
        if (!page || !limit) {
            throw new Error("page/limit constraints not provided");
        }

        const [companies, total] = await this._companyRepository.findPaginated(page, limit, search, verificationStatus);

        console.log("companies", companies);
        const totalPages = Math.ceil(total / limit);

        const paginationMeta: PaginationMeta = {
            page,
            limit,
            totalItems: total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };

        const data: ICompanyListItem[] = CompanyMapper.mapCompaniesToList(companies);
        return { data, paginationMeta };
    }

    async getUserById(userId: string): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid user ID");
        }

        const user = await this._userRepository.findByIdWithPopulate<IUserPopulated>(userId, ["skills"]);

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return toUserProfileDTO(user);
    }

    async blockUserWithComment(userId: string, comment: string): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid user ID");
        }

        const user = await this._userRepository.findByIdAndUpdate(userId, {
            isBlocked: true,
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        const populatedUser = await this._userRepository.findByIdWithPopulate<IUserPopulated>(userId, ["skills"]);

        if (!populatedUser) {
            throw new AppError("User not found after population", 404);
        }

        // Send block notification email with reason
        await this._emailService.send(user.email, `${user.firstName} ${user.lastName || ""}`.trim(), comment);

        // Invalidate all user sessions
        // await this._cacheService.delete(`user_sessions:${userId}`);

        return toUserProfileDTO(populatedUser);
    }

    async getCompanyById(companyId: string): Promise<CompanyProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid company ID");
        }

        const company = await this._companyRepository.findByIdWithPopulate<ICompany>(companyId, ["address"]);

        if (!company) {
            throw new AppError("Company not found", 404);
        }

        if (company?.documents && company.documents.length > 0) {
            const signedUrlPromise = company.documents.map(async (document) => {
                const documentSignedUrl = await this._fileService.generateSignedUrl(document.key, 3600 * 6);
                document.signedURL = documentSignedUrl;
            });
            await Promise.all(signedUrlPromise);
        }

        return CompanyMapper.toCompanyProfileDTO(company);
    }

    async verifyCompany(companyId: string): Promise<CompanyProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid company ID");
        }

        const company = await this._companyRepository.findById(companyId);

        if (!company) {
            throw new AppError("Company not found", 404);
        }

        const result = CompanyVerificationHelper.evaluate(company);

        if (result.missingFields.length > 0) {
            throw new ValidationError(`Company profile incomplete. Missing: ${result.missingFields.join(", ")}`);
        }

        company.verificationStatus = "verified";
        await company.save();

        // Send verification email
        await this._emailService.send(
            company.email,
            "Company verification successful",
            `CareerCraft has verified ${company.name} successfully`,
        );

        return CompanyMapper.toCompanyProfileDTO(company);
    }

    async rejectCompanyVerification(companyId: string, code: CompanyRejectionCodes, description: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid company ID");
        }

        const company = await this._companyRepository.findById(companyId);

        if (!company) {
            throw new AppError("Company not found", 404);
        }
        company.verificationStatus = "rejected";

        company.rejectionReasons.push({ code, description, rejectedAt: new Date() });

        await company.save();

        // Send rejection email with comment
        // await this._emailService.send(company.email, company.name, comment);
    }

    async blockUser(id: string) {
        if (!id) {
            throw new Error("user credential(id) is missing");
        }
        const updatedUser = await this._userRepository.blockOrUnblock(id, true);

        if (!updatedUser) {
            throw new AppError("User not found");
        }

        return updatedUser;
    }
    async unblockUser(id: string) {
        if (!id) {
            throw new Error("user credential(id) is missing");
        }
        const updatedUser = await this._userRepository.blockOrUnblock(id, false);
        if (!updatedUser) {
            throw new AppError("User not found");
        }
        return updatedUser;
    }

    async blockCompany(id: string) {
        if (!id) {
            throw new Error("user credential(id) is missing");
        }
        const updatedCompany = await this._companyRepository.blockOrUnblock(id, true);
        if (!updatedCompany) {
            throw new AppError("Company not found");
        }
        return updatedCompany;
    }
    async unblockCompany(id: string) {
        if (!id) {
            throw new Error("user credential(id) is missing");
        }
        const updatedCompany = await this._companyRepository.blockOrUnblock(id, false);
        if (!updatedCompany) {
            throw new AppError("Company not found");
        }
        return updatedCompany;
    }

    async getDocumentSignedUrl(documentKey: string): Promise<string> {
        if (!documentKey) {
            throw new ValidationError("Document key is required");
        }

        // Generate signed URL valid for 1 hour
        const url = await this._fileService.generateSignedUrl(documentKey, 3600);

        return url;
    }
}
