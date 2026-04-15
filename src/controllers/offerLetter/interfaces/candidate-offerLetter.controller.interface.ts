import { Request, Response, NextFunction } from "express";

export interface ICandidateOfferLetterController {
    listOffers(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response>;

    getOffer(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response>;

    respondToOffer(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response>;

    uploadSignedDocument(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response>;

    downloadPdf(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void>;
}