import { UserProfileDTO } from "../../../dtos/userProfile.dto";

export interface IUserProfileService {
    getUserProfile(id: string): Promise<UserProfileDTO>;
}
