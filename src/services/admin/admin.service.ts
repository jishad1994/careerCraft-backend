import { UsersPaginatedDTO } from "../../dtos/admin.dto";
import { ICompanyRepository } from "../../repositories/company/company.repository.interface";
import { IUserRepository } from "../../repositories/user/user.repository.interface";
import { IAdminService } from "./admin.service.interface";
import { IUser, IUserPopulated } from "../../models/user/user.interface";
import { ICompany } from "../../models/company/company.interface";
import { PaginationMeta } from "../../utils/apiResponse.utils";
import { ValidationError } from "../../errors/validation.error";
import mongoose from "mongoose";
import { AppError } from "../../errors/app.error.";
import { IFileService } from "../file-service/interfaces/file.service.interface";
import { IEmailService } from "../email_service/email.service.interface";
import { toUserProfileDTO } from "../../mappers/user.mapper";
import { UserProfileDTO } from "../../dtos/userProfile.dto";
import { ICacheService } from "../cache/cache.service.interface";

export class AdminService implements IAdminService {
    constructor(
        private _userRepository: IUserRepository,
        private _companyRepository: ICompanyRepository,
        private _emailService: IEmailService,
        private _fileService: IFileService,
        private _cacheService: ICacheService
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

    async getCompanies(page: number, limit: number, search?: string): Promise<UsersPaginatedDTO<ICompany>> {
        if (!page || !limit) {
            throw new Error("page/limit constraints not provided");
        }

        const [data, total] = await this._companyRepository.findPaginated(page, limit, search);

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

    async getCompanyById(companyId: string): Promise<ICompany> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid company ID");
        }

        const company = await this._companyRepository.findById(companyId);

        if (!company) {
            throw new AppError("Company not found", 404);
        }

        return company;
    }

    async verifyCompany(companyId: string): Promise<ICompany> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid company ID");
        }

        const company = await this._companyRepository.findByIdAndUpdate(companyId, {
            isVerified: true,
        });

        if (!company) {
            throw new AppError("Company not found", 404);
        }

        // Send verification success email
        await this._emailService.send(
            company.email,
            "Company verification successfull",
            `CarerCraft has verified ${company.name} successfully`
        );

        return company;
    }

    async rejectCompanyVerification(companyId: string, comment: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ValidationError("Invalid company ID");
        }

        const company = await this._companyRepository.findById(companyId);

        if (!company) {
            throw new AppError("Company not found", 404);
        }

        // Send rejection email with comment
        await this._emailService.send(company.email, company.name, comment);
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
