import { UserProfileDTO } from "../../../dtos/userProfile.dto";
import { IEducation, IUser } from "../../../models/user/user.interface";

export interface IUserProfileService {
    getUserProfile(id: string): Promise<UserProfileDTO>;
    updateUserProfile(userId: string, profileData: Partial<IUser>): Promise<UserProfileDTO>;
    addUserSkills(userId: string, skillIds: string[]): Promise<UserProfileDTO>;
    updateUserProfilePicture(userId: string, profilePicture: Express.Multer.File): Promise<UserProfileDTO>;
    deleteUserProfilePicture(userId: string): Promise<UserProfileDTO>;
    addUserEducation(userId: string, education: IEducation): Promise<UserProfileDTO>;
}
