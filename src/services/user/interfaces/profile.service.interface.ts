import { UserProfileDTO } from "../../../dtos/userProfile.dto";

export interface IUserProfileService {
    getProfile(email: string): Promise<UserProfileDTO>;
}
