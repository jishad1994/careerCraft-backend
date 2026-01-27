import { UserProfileDTO } from "../../../dtos/userProfile.dto";
import { AppError } from "../../../errors/app.error.";
import { ValidationError } from "../../../errors/validation.error";
import { toUserProfileDTO } from "../../../mappers/user.mapper";
import { IDocument, IEducation, IExperience, IUser, IUserPopulated } from "../../../models/user/user.interface";
import { IUserRepository } from "../../../repositories/user/user.repository.interface";
import { IFileService } from "../../file-service/interfaces/file.service.interface";
import { IUserProfileService } from "../interfaces/profile.service.interface";
import mongoose from "mongoose";

export class UserProfileService implements IUserProfileService {
    constructor(
        private _userRepository: IUserRepository,
        private _fileService: IFileService,
    ) {}

    async getUserProfile(id: string): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ValidationError("invalid user Id");
        }
        const userProfileDataPopulated = await this._userRepository.findByIdWithPopulate<IUserPopulated>(id, ["skills"]);

        if (!userProfileDataPopulated) {
            throw new AppError("User not found");
        }
        if (userProfileDataPopulated.resumeURL && userProfileDataPopulated.resumeURL.length > 0) {
            const signedUrlPromise = userProfileDataPopulated.resumeURL.map(async (resume) => {
                const resumeSignedURL = await this._fileService.generateSignedUrl(resume.key, 3600 * 6);
                resume.signedURL = resumeSignedURL;
            });

            await Promise.all(signedUrlPromise);
        }


        return toUserProfileDTO(userProfileDataPopulated);
    }

    async updateUserProfile(id: string, profileData: Partial<IUser>): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ValidationError("invalid user Id");
        }
        const updatedUser = await this._userRepository.findByIdAndUpdate(id, profileData);
        if (!updatedUser) {
            throw new AppError("User not found");
        }

        const populatedUser = await this._userRepository.findByIdWithPopulate<IUserPopulated>(id, ["skills"]);

        if (!populatedUser) {
            throw new AppError("User not found after update");
        }

        return toUserProfileDTO(populatedUser);
    }

    async addUserSkill(userId: string, skillId: string): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid user id");
        }

        const skillUpdatedUser = await this._userRepository.addSkill(userId, skillId);

        if (!skillUpdatedUser) {
            throw new AppError("User not found after update");
        }

        const populatedUser = await this._userRepository.findByIdWithPopulate<IUserPopulated>(userId, ["skills"]);

        if (!populatedUser) {
            throw new AppError("User not found after populate");
        }

        return toUserProfileDTO(populatedUser);
    }
    async removeUserSkill(userId: string, skillId: string): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid user id");
        }

        const skillUpdatedUser = await this._userRepository.removeSkill(userId, skillId);

        if (!skillUpdatedUser) {
            throw new AppError("User not found after update");
        }

        const populatedUser = await this._userRepository.findByIdWithPopulate<IUserPopulated>(userId, ["skills"]);

        if (!populatedUser) {
            throw new AppError("User not found after populate");
        }

        return toUserProfileDTO(populatedUser);
    }

    async updateUserProfilePicture(userId: string, profilePicture: Express.Multer.File): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid user id");
        }

        const { key, location } = await this._fileService.uploadProfilePicture(profilePicture, userId);

        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new AppError("User not found");
        }

        const oldProfilePictureKey = user.profilePicture?.key;

        user.profilePicture = { key, location };
        await user.save();

        if (oldProfilePictureKey) {
            try {
                await this._fileService.deleteFile(oldProfilePictureKey);

                console.log("old one deleted");
            } catch (err) {
                console.error("Failed to delete old profile picture:", err);
            }
        }

        const populatedUser = await this._userRepository.findByIdWithPopulate<IUserPopulated>(userId, ["skills"]);
        if (!populatedUser) {
            throw new AppError("User not found after populate");
        }

        return toUserProfileDTO(populatedUser);
    }

    async deleteUserProfilePicture(userId: string): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid user id");
        }

        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new AppError("User not found");
        }

        const oldProfilePictureKey = user.profilePicture?.key;

        if (oldProfilePictureKey) {
            try {
                user.profilePicture = undefined;
                await user.save();
                await this._fileService.deleteFile(oldProfilePictureKey);

                console.log("old one deleted");
            } catch (err) {
                console.error("Failed to delete old profile picture:", err);
            }
        }

        const populatedUser = await this._userRepository.findByIdWithPopulate<IUserPopulated>(userId, ["skills"]);
        if (!populatedUser) {
            throw new AppError("User not found after populate");
        }

        return toUserProfileDTO(populatedUser);
    }

    async addUserEducation(userId: string, education: IEducation): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid user id");
        }

        const user = await this._userRepository.findById(userId);

        if (!user) {
            throw new AppError("User not found");
        }
        user?.education.push(education);
        await user?.save();
        const populatedUser = await this._userRepository.findByIdWithPopulate<IUserPopulated>(userId, ["skills"]);
        if (!populatedUser) {
            throw new AppError("User not found after populate");
        }

        return toUserProfileDTO(populatedUser);
    }

    async deleteUserEducation(userId: string, index: number): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid user id");
        }

        const user = await this._userRepository.findById(userId);

        if (!user) {
            throw new AppError("User not found");
        }

        user.education.splice(index, 1);
        await user.save();
        const populatedUser = await this._userRepository.findByIdWithPopulate<IUserPopulated>(userId, ["skills"]);
        if (!populatedUser) {
            throw new AppError("User not found after populate");
        }
        return toUserProfileDTO(populatedUser);
    }

    async updateUserEducation(userId: string, index: number, education: IEducation): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid user id");
        }

        const user = await this._userRepository.findById(userId);

        if (!user) {
            throw new AppError("User not found");
        }

        user.education[index] = education;

        user.save();

        const populatedUser = await this._userRepository.findByIdWithPopulate<IUserPopulated>(userId, ["skills"]);
        if (!populatedUser) {
            throw new AppError("User not found after populate");
        }
        return toUserProfileDTO(populatedUser);
    }

    async addUserExperience(userId: string, experience: IExperience): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid user id");
        }

        const user = await this._userRepository.findById(userId);

        if (!user) {
            throw new AppError("User not found");
        }
        user?.experience.push(experience);
        await user?.save();
        const populatedUser = await this._userRepository.findByIdWithPopulate<IUserPopulated>(userId, ["skills"]);
        if (!populatedUser) {
            throw new AppError("User not found after populate");
        }

        return toUserProfileDTO(populatedUser);
    }

    async updateUserExperience(userId: string, index: number, experience: IExperience): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid user id");
        }

        const user = await this._userRepository.findById(userId);

        if (!user) {
            throw new AppError("User not found");
        }

        user.experience[index] = experience;

        user.save();

        const populatedUser = await this._userRepository.findByIdWithPopulate<IUserPopulated>(userId, ["skills"]);
        if (!populatedUser) {
            throw new AppError("User not found after populate");
        }
        return toUserProfileDTO(populatedUser);
    }

    async deleteUserExperience(userId: string, index: number): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid user id");
        }

        const user = await this._userRepository.findById(userId);

        if (!user) {
            throw new AppError("User not found");
        }

        user.experience.splice(index, 1);
        await user.save();
        const populatedUser = await this._userRepository.findByIdWithPopulate<IUserPopulated>(userId, ["skills"]);
        if (!populatedUser) {
            throw new AppError("User not found after populate");
        }
        return toUserProfileDTO(populatedUser);
    }

    async uploadCertificate(userId: string, document: Express.Multer.File): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid user id");
        }

        const user = await this._userRepository.findById(userId);

        if (!user) throw new AppError("Company not found");

        const key = await this._fileService.uplodaFile(document, "documents", userId);

        const newDoc: IDocument = {
            originalName: document.originalname,
            key: key,
            mimeType: document.mimetype,
            size: document.size,
            uploadedAt: new Date(),
        };

        user.certificates.push(newDoc);

        await user.save();

        const populatedUser = await this._userRepository.findByIdWithPopulate<IUserPopulated>(userId, ["skills"]);

        if (!populatedUser) {
            throw new AppError("user not found after populate");
        }
        return toUserProfileDTO(populatedUser);
    }

    async deleteCertificate(userId: string, documentKey: string): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid company id");
        }

        const user = await this._userRepository.findById(userId);
        if (!user) throw new AppError("user not found");

        user.certificates = user.certificates.filter((doc) => doc.key !== documentKey);

        await user.save();

        try {
            await this._fileService.deleteFile(documentKey);
        } catch (err) {
            console.error("Failed to delete document:", err);
        }

        const populated = await this._userRepository.findByIdWithPopulate<IUserPopulated>(userId, ["skills"]);
        if (!populated) {
            throw new AppError("company not found after populate");
        }
        return toUserProfileDTO(populated);
    }

    async uploadResume(userId: string, document: Express.Multer.File): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid user id");
        }

        const user = await this._userRepository.findById(userId);

        if (!user) throw new AppError("Company not found");

        const key = await this._fileService.uplodaFile(document, "resumes", userId);

        const newDoc: IDocument = {
            originalName: document.originalname,
            key: key,
            mimeType: document.mimetype,
            size: document.size,
            uploadedAt: new Date(),
        };

        user.resumeURL.push(newDoc);

        await user.save();

        const populatedUser = await this._userRepository.findByIdWithPopulate<IUserPopulated>(userId, ["skills"]);

        if (!populatedUser) {
            throw new AppError("user not found after populate");
        }
        return toUserProfileDTO(populatedUser);
    }

    async deleteResume(userId: string, documentKey: string): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid user id");
        }

        const user = await this._userRepository.findById(userId);
        if (!user) throw new AppError("user not found");

        user.resumeURL = user.resumeURL.filter((doc) => doc.key !== documentKey);

        await user.save();

        try {
            await this._fileService.deleteFile(documentKey);
        } catch (err) {
            console.error("Failed to delete resume:", err);
        }

        const populated = await this._userRepository.findByIdWithPopulate<IUserPopulated>(userId, ["skills"]);
        if (!populated) {
            throw new AppError("user not found after populate");
        }
        return toUserProfileDTO(populated);
    }
}
