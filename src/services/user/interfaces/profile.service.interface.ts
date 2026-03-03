import { GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { UserProfileDTO } from "../../../dtos/userProfile.dto";
import { IEducation, IExperience, IUser } from "../../../models/user/user.interface";

export interface IUserProfileService {
    getUserProfile(id: string): Promise<UserProfileDTO>;
    updateUserProfile(userId: string, profileData: Partial<IUser>): Promise<UserProfileDTO>;

    addUserSkill(userId: string, skillId: string): Promise<UserProfileDTO>;
    removeUserSkill(userId: string, skillId: string): Promise<UserProfileDTO>;

    updateUserProfilePicture(userId: string, profilePicture: Express.Multer.File): Promise<UserProfileDTO>;
    deleteUserProfilePicture(userId: string): Promise<UserProfileDTO>;

    addUserEducation(userId: string, education: IEducation): Promise<UserProfileDTO>;
    deleteUserEducation(userId: string, index: number): Promise<UserProfileDTO>;
    updateUserEducation(userId: string, index: number, education: IEducation): Promise<UserProfileDTO>;

    addUserExperience(userId: string, experience: IExperience): Promise<UserProfileDTO>;
    updateUserExperience(userId: string, index: number, experience: IExperience): Promise<UserProfileDTO>;
    deleteUserExperience(userId: string, index: number): Promise<UserProfileDTO>;

    uploadCertificate(userId: string, document: Express.Multer.File): Promise<UserProfileDTO>;
    deleteCertificate(userId: string, documentKey: string): Promise<UserProfileDTO>;

    uploadResume(userId: string, document: Express.Multer.File): Promise<UserProfileDTO>;
    deleteResume(userId: string, documentKey: string): Promise<UserProfileDTO>;

    updateUserBannerImage(userId: string, bannerImage: Express.Multer.File): Promise<UserProfileDTO>;
    deleteUserBannerImage(userId: string): Promise<UserProfileDTO>;

    getResume(userId: string, resumeName: string): Promise<GetObjectCommandOutput>;
    getResumeByResumeKey(userId: string, resumeKey: string): Promise<GetObjectCommandOutput>;
}
