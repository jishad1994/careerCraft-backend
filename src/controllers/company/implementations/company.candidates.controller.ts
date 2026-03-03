import { Request, Response, NextFunction } from "express";
import { ICompanyCandidatesController } from "../interfaces/company.candidates.controller.interface";
import { UserProfileService } from "../../../services/user/implementations/profile.service";
import { AuthError } from "../../../errors-classes/auth.error";
import { ValidationError } from "../../../errors-classes/validation.error";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { COMPANY_CANDIDATES_MESSAGE } from "../../../constants/messages/company.messages.constants";
import { Readable } from "stream";

export class CompanyCandidateController implements ICompanyCandidatesController {
    constructor(private readonly _userProfileService: UserProfileService) {}

    async getCandidateProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const company = req.user;
            if (!company) {
                throw new AuthError("Unauthorized error");
            }

            const { candidateId } = req.params;
            if (!candidateId) {
                throw new ValidationError("No candidate id found");
            }
            const profile = await this._userProfileService.getUserProfile(candidateId);
            return ApiResponse.success(res, COMPANY_CANDIDATES_MESSAGE.CANDIDATE_PROFILE_FETCH_SUCCESSFULL, profile);
        } catch (error) {
            next(error);
        }
    }

    async getCandidateResumeStream(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const company = req.user;
            if (!company) {
                throw new AuthError("Unauthorized error");
            }

            const { candidateId } = req.params;

            const mode = req.query.mode || "view";
            const resumeKey = req.query.resumeKey?.toString();

            if (!candidateId || !resumeKey) {
                throw new ValidationError("No candidate id or resume key found");
            }

            const fileStream = await this._userProfileService.getResumeByResumeKey(candidateId, resumeKey);

            res.setHeader("Content-Type", fileStream.ContentType || "application/pdf");

            if (mode === "download") {
                res.setHeader("Content-Disposition", `attachment; filename="resume-${candidateId}.pdf"`);
            } else {
                res.setHeader("Content-Disposition", `inline; filename="resume-${candidateId}.pdf"`);
            }

            (fileStream.Body as Readable).pipe(res);
        } catch (error) {
            next(error);
        }
    }
}
