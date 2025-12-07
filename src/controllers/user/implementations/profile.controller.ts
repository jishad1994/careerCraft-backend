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

            console.log("user is", user);
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

    async addUserSkills(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;

            if (!user) {
                throw new AuthError("Unauthorized");
            }

            const skillIds = req.body;

            const updatedUser = await this._userProfileService.addUserSkills(user.id, skillIds);

            return ApiResponse.created(res, "user skills added", updatedUser);
        } catch (error) {
            next(error);
        }
    }
}
