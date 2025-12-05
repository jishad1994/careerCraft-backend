import { UserProfileDTO } from "../../../dtos/userProfile.dto";
import { AppError } from "../../../errors/app.error.";
import { ValidationError } from "../../../errors/validation.error";
import { toUserProfileDTO } from "../../../mappers/user.mapper";
import { IUserPopulated } from "../../../models/user/user.interface";
import { IUserRepository } from "../../../repositories/user/user.repository.interface";
import { IUserProfileService } from "../interfaces/profile.service.interface";
import mongoose from "mongoose";

export class UserProfileService implements IUserProfileService {
    constructor(private _userRepository: IUserRepository) {}

    async getUserProfile(id: string): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ValidationError("invalid user Id");
        }
        const userDocumentPopulated = await this._userRepository.findByIdWithPopulate<IUserPopulated>(id, ["skills"]);

        if (!userDocumentPopulated) {
            throw new AppError("User not found");
        }

        const userProfileData: UserProfileDTO = toUserProfileDTO(userDocumentPopulated);

        return userProfileData;
    }
}
