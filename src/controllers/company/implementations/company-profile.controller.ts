import { Request, Response, NextFunction } from "express";
import { ICompanyProfileService } from "../../../services/company/interfaces/profile.service.interface";
import { ICompanyProfileController } from "../interfaces/company-profile.controller.interface";
import { AppError } from "../../../errors/app.error.";
import { CompanyProfileDTO } from "../../../dtos/companyProfile.dto";

export class CompanyProfileController implements ICompanyProfileController {
    constructor(private _companyProfileService: ICompanyProfileService) {}

    async getProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user;
            if (!user) throw new AppError("User not found");
            const companyProfileData: CompanyProfileDTO = await this._companyProfileService.getProfile(user.id);
            res.status(200).json({
                success: true,
                message: "company profile fetching successfull",
                data: companyProfileData,
            });
        } catch (error) {
            next(error);
        }
    }
}
