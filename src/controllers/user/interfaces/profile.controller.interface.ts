import { NextFunction, Request, Response } from "express";

export interface IUserProfileController {
    getUserProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    updateUserProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    addUserSkill(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    removeUserSkill(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    updateProfilePicture(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    deleteProfilePicture(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    updateBannerImage(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    deleteBannerImage(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    addEducation(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    updateEducation(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    deleteEducation(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    addExperience(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    updateExperience(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    deleteExperience(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    addResume(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    deleteResume(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    addCertificate(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    deleteCertificate(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    deleteCertificate(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getResume(req: Request, res: Response, next: NextFunction): Promise<void>;
}
