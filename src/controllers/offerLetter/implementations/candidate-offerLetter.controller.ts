import { NextFunction, Request, Response } from "express";
import { IOfferLetterService } from "../../../shared/services/offerLetter-service/offerLetter.service.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { AppError } from "../../../errors-classes/app.error.";
import { ICandidateRespondDto } from "../../../models/offer-letter/offerLetter.interface";
import { ICandidateOfferLetterController } from "../interfaces/candidate-offerLetter.controller.interface";

export class CandidateOfferLetterController implements ICandidateOfferLetterController {
    constructor(private readonly offerService: IOfferLetterService) {}

    private getUserId(req: Request): string {
        const id = req.user?.id;
        if (!id) throw new AppError("Authentication required");
        return id;
    }

    async listOffers(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        try {
            const userId = this.getUserId(req);
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as string | undefined;

            const { offers, paginationMeta } = await this.offerService.getCandidateOffers(userId, page, limit, status);

            return ApiResponse.success(res, "Offers fetched successfully", offers, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

    async getOffer(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        try {
            const userId = this.getUserId(req);

            const offer = await this.offerService.getOfferForCandidate(req.params.id, userId);

            return ApiResponse.success(res, "Offer fetched successfully", offer);
        } catch (error) {
            next(error);
        }
    }

    async respondToOffer(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        try {
            const userId = this.getUserId(req);
            const dto: ICandidateRespondDto = req.body;

            if (!dto.action || !["accept", "reject"].includes(dto.action)) {
                throw new AppError("action must be 'accept' or 'reject'");
            }

            const offer = await this.offerService.respondToOffer(req.params.id, userId, dto);

            const message = dto.action === "accept" ? "Offer accepted successfully" : "Offer rejected successfully";

            return ApiResponse.success(res, message, offer);
        } catch (error) {
            next(error);
        }
    }

    async uploadSignedDocument(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        try {
            const userId = this.getUserId(req);
            const file = req.file as Express.Multer.File;

            if (!file) {
                throw new AppError("Signed document file is required");
            }
            if (file.mimetype !== "application/pdf") {
                throw new AppError("Only PDF files are allowed");
            }
            if (file.size > 5 * 1024 * 1024) {
                throw new AppError("File size must be less than 5MB");
            }

            const offer = await this.offerService.uploadSignedDocument(req.params.id, userId, file);

            return ApiResponse.success(res, "Signed document uploaded successfully", offer);
        } catch (error) {
            next(error);
        }
    }

    async downloadPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = this.getUserId(req);

            const buffer = await this.offerService.generateOfferPdf(req.params.id, userId, "candidate");

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=offer-letter.pdf");
            res.setHeader("Content-Length", buffer.length.toString());
            res.send(buffer);
        } catch (error) {
            next(error);
        }
    }
}
