import { UserProfileDTO } from "../../../dtos/userProfile.dto";
import { AppError } from "../../../errors/app.error.";
import { AuthError } from "../../../errors/auth.error";
import { IUserProfileService } from "../../../services/user/interfaces/profile.service.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { IUserProfileController } from "../interfaces/profile.controller.interface";
import { NextFunction, Request, Response } from "express";

import { Readable } from "stream";

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
            console.log(error);
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

    async deleteBannerImage(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) {
                throw new AuthError("Unauthorized");
            }

            const updatedUser = await this._userProfileService.deleteUserBannerImage(user.id);

            return ApiResponse.success(res, "User banner image deleted successfully", updatedUser);
        } catch (error) {
            next(error);
        }
    }

    async updateBannerImage(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) {
                throw new AuthError("Unauthorized");
            }
            const file = req.file;
            if (!file) {
                throw new AppError("File not found");
            }

            const updatedUser = await this._userProfileService.updateUserBannerImage(user.id, file);

            return ApiResponse.success(res, "User banner image updated successfully", updatedUser);
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

    async addResume(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) {
                throw new AuthError("Unauthorized");
            }

            const resume = req.file;

            if (!resume) {
                throw new AppError("Resume file not found");
            }

            const updatedProfile = await this._userProfileService.uploadResume(user.id, resume);

            return ApiResponse.success(res, "User resume added successfully", updatedProfile);
        } catch (error) {
            next(error);
        }
    }

    async deleteResume(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) {
                throw new AuthError("Unauthorized");
            }

            const { documentKey } = req.query;

            if (!documentKey) throw new AppError("Document key not found");

            const updatedProfile = await this._userProfileService.deleteResume(user.id, documentKey.toString());

            return ApiResponse.success(res, "User resume deleted successfully", updatedProfile);
        } catch (error) {
            next(error);
        }
    }

    async addCertificate(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) {
                throw new AuthError("Unauthorized");
            }

            const certificate = req.file;

            if (!certificate) {
                throw new AppError("Certificate file not found");
            }

            const updatedProfile = await this._userProfileService.uploadCertificate(user.id, certificate);

            return ApiResponse.success(res, "User certificate added successfully", updatedProfile);
        } catch (error) {
            next(error);
        }
    }
    async deleteCertificate(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) {
                throw new AuthError("Unauthorized");
            }

            const { documentKey } = req.query;

            if (!documentKey) throw new AppError("Document key not found");

            const updatedProfile = await this._userProfileService.deleteCertificate(user.id, documentKey.toString());

            return ApiResponse.success(res, "User certificate deleted successfully", updatedProfile);
        } catch (error) {
            next(error);
        }
    }
    async getResume(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                throw new AuthError("Unauthorized");
            }
            const { resumeName } = req.params;
            const mode = (req.query.mode as string) || "view";

            const fileStream = await this._userProfileService.getResume(user.id, resumeName);
            if (mode === "download") {
                res.setHeader("Content-Disposition", `attachment; filename="resume-${fileStream}.pdf"`);
            } else {
                res.setHeader("Content-Disposition", `inline; filename="resume-${resumeName}.pdf"`);
            }
            (fileStream.Body as Readable).pipe(res);
        } catch (error) {
            next(error);
        }
    }
}
