import { NextFunction, Request, Response } from "express";

export interface ICompanyProfileController {
    getProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    updateBasicProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    updateProfilePicture(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    updateAddress(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    deleteProfilePicture(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    updateBannerImage(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    deleteBannerImage(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    uploadDocument(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    deleteDocument(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    
    viewDocument(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    
    reapplyForVerification(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
