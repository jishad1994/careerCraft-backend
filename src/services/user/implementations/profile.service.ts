import { UserProfileDTO } from "../../../dtos/userProfile.dto";
import { AppError } from "../../../errors/app.error.";
import { ValidationError } from "../../../errors/validation.error";
import { toUserProfileDTO } from "../../../mappers/user.mapper";
import { IUser, IUserPopulated } from "../../../models/user/user.interface";
import { IUserRepository } from "../../../repositories/user/user.repository.interface";
import { IUserProfileService } from "../interfaces/profile.service.interface";
import mongoose from "mongoose";

export class UserProfileService implements IUserProfileService {
    constructor(private _userRepository: IUserRepository) {}

    async getUserProfile(id: string): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ValidationError("invalid user Id");
        }
        const userProfileDataPopulated = await this._userRepository.findByIdWithPopulate<IUserPopulated>(id, ["skills"]);

        if (!userProfileDataPopulated) {
            throw new AppError("User not found");
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

    async addUserSkills(userId: string, skillIds: string[]): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError("Invalid user id");
        }

        const skillUpdatedUser = await this._userRepository.addSkills(userId, skillIds);
        if (!skillUpdatedUser) {
            throw new AppError("User not found after update");
        }

        const populatedUser = await this._userRepository.findByIdWithPopulate<IUserPopulated>(userId, ["skills"]);

        if (!populatedUser) {
            throw new AppError("User not found after populate");
        }

        return toUserProfileDTO(populatedUser);
    }
}
