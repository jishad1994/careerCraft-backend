import { Request, Response, NextFunction } from "express";

export interface ICompanyOfferLetterController {
    createOffer(req: Request, res: Response, next: NextFunction): Promise<void | Response>;

    listOffers(req: Request, res: Response, next: NextFunction): Promise<void | Response>;

    getOffer(req: Request, res: Response, next: NextFunction): Promise<void | Response>;

    verifyOffer(req: Request, res: Response, next: NextFunction): Promise<void | Response>;

    downloadPdf(req: Request, res: Response, next: NextFunction): Promise<void>;

    getSignedDocument(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
}
