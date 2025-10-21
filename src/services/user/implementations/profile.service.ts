import { UserProfileDTO } from "../../../dtos/userProfile.dto";
import { AppError } from "../../../errors/app.error.";
import { ValidationError } from "../../../errors/validation.error";
import { toUserProfileDTO } from "../../../mappers/user.mapper";
import { IUserRepository } from "../../../repositories/user/user.repository.interface";
import { IUserProfileService } from "../interfaces/profile.service.interface";
import mongoose from "mongoose";

export class UserProfileService implements IUserProfileService {
    constructor(private _userRepository: IUserRepository) {}

    async getProfile(id: string): Promise<UserProfileDTO> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ValidationError("invalid user Id");
        }
        const userDocument = await this._userRepository.findById(id);

        if (!userDocument) {
            throw new AppError("No user found");
        }

        const user = (await userDocument.populate("skills")).toObject();

        const userProfileData: UserProfileDTO = toUserProfileDTO(user);

        console.log(userProfileData);

        return userProfileData;
    }
}
