import { UserProfileDTO } from "../../../dtos/userProfile.dto";
import { AppError } from "../../../errors/app.error.";
import { AuthError } from "../../../errors/auth.error";
import { IUserProfileService } from "../../../services/user/interfaces/profile.service.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { IUserProfileController } from "../interfaces/profile.controller.interface";
import { NextFunction, Request, Response } from "express";

export class UserProfileController implements IUserProfileController {
    constructor(private _userProfileService: IUserProfileService) {}
    async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) throw new AppError("User Not Found");
            const userProfileData: UserProfileDTO = await this._userProfileService.getUserProfile(user.id);
            res.status(200).json({
                success: true,
                message: "user profile fetching successfull",
                data: userProfileData,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateUserProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;

            if (!user) {
                throw new AuthError("User unauthorized");
            }
            const userProfileData = req.body;
            if (!userProfileData) {
                throw new AppError("Form data is not recieved");
            }
            const updatedUserData = await this._userProfileService.updateUserProfile(user.id, userProfileData);

            ApiResponse.success<UserProfileDTO>(res, "User profile updated successfully", updatedUserData);
        } catch (error) {
            next(error);
        }
    }

    async addUserSkill(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;

            if (!user) {
                throw new AuthError("Unauthorized");
            }

            const { skillId } = req.body;

            const updatedUser = await this._userProfileService.addUserSkill(user.id, skillId);

            return ApiResponse.created(res, "user skill added", updatedUser);
        } catch (error) {
            next(error);
        }
    }

    async removeUserSkill(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;

            if (!user) {
                throw new AuthError("Unauthorized");
            }

            const skillId = req.params.id;

            const updatedUser = await this._userProfileService.removeUserSkill(user.id, skillId);

            return ApiResponse.created(res, "user skill removed successfully", updatedUser);
        } catch (error) {
            next(error);
        }
    }

    async updateProfilePicture(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) {
                throw new AuthError("Unauthorized");
            }
            const file = req.file;
            if (!file) {
                throw new AppError("File not found");
            }

            const updatedUser = await this._userProfileService.updateUserProfilePicture(user.id, file);

            return ApiResponse.success(res, "User profile picture updated successfully", updatedUser);
        } catch (error) {
            next(error);
        }
    }

    async deleteProfilePicture(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) {
                throw new AuthError("Unauthorized");
            }

            const updatedUser = await this._userProfileService.deleteUserProfilePicture(user.id);

            return ApiResponse.success(res, "User profile picture deleted successfully", updatedUser);
        } catch (error) {
            next(error);
        }
    }

    async addEducation(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) {
                throw new AuthError("Unauthorized");
            }

            const education = req.body;

            const updatedUser = await this._userProfileService.addUserEducation(user.id, education);

            return ApiResponse.success(res, "User education added successfully", updatedUser);
        } catch (error) {
            next(error);
        }
    }
    async updateEducation(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) {
                throw new AuthError("Unauthorized");
            }

            const { index, education } = req.body;

            const updatedUser = await this._userProfileService.updateUserEducation(user.id, index, education);

            return ApiResponse.success(res, "User education updated successfully", updatedUser);
        } catch (error) {
            next(error);
        }
    }
    async deleteEducation(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) {
                throw new AuthError("Unauthorized");
            }

            const index = Number(req.params.index);

            const updatedUser = await this._userProfileService.deleteUserEducation(user.id, index);

            return ApiResponse.success(res, "User education deleted successfully", updatedUser);
        } catch (error) {
            next(error);
        }
    }

    async addExperience(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) {
                throw new AuthError("Unauthorized");
            }

            const experience = req.body;

            const updatedUser = await this._userProfileService.addUserExperience(user.id, experience);

            return ApiResponse.success(res, "User experience successfully", updatedUser);
        } catch (error) {
            next(error);
        }
    }

    async updateExperience(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) {
                throw new AuthError("Unauthorized");
            }

            const { index, experience } = req.body;

            const updatedUser = await this._userProfileService.updateUserExperience(user.id, index, experience);

            return ApiResponse.success(res, "User experience updated successfully", updatedUser);
        } catch (error) {
            next(error);
        }
    }

    async deleteExperience(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) {
                throw new AuthError("Unauthorized");
            }

            const index = Number(req.params.index);

            const updatedUser = await this._userProfileService.deleteUserExperience(user.id, index);

            return ApiResponse.success(res, "User experience deleted successfully", updatedUser);
        } catch (error) {
            next(error);
        }
    }
}
