import { UserProfileDTO } from "../../../dtos/userProfile.dto";
import { AppError } from "../../../errors/app.error.";
import { IUserProfileService } from "../../../services/user/interfaces/profile.service.interface";
import { IUserProfileController } from "../interfaces/profile.controller.interface";
import { NextFunction, Request, Response } from "express";

export class UserProfileController implements IUserProfileController {
    constructor(private _userProfileService: IUserProfileService) {}
    async getProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) throw new AppError("User Not Found");
            const userProfileData: UserProfileDTO = await this._userProfileService.getProfile(user.id);
            res.status(200).json({
                success: true,
                message: "user profile fetching successfull",
                data: userProfileData,
            });
        } catch (error) {
            next(error);
    
        }
    }
}
