import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../errors-classes/app.error.";
import { IOfferLetterService } from "../../../shared/services/offerLetter-service/offerLetter.service.interface";
import { ICreateOfferLetterDto } from "../../../models/offer-letter/offerLetter.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { ICompanyOfferLetterController } from "../interfaces/company-offerLetter.controller.interface";
import { ValidationError } from "../../../errors-classes/validation.error";

export class CompanyOfferLetterController implements ICompanyOfferLetterController {
    constructor(private readonly offerService: IOfferLetterService) {}

    private getCompanyId(req: Request): string {
        const id = req.user?.id;
        if (!id) throw new AppError("Company authentication required");
        return id;
    }

    async createOffer(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        try {
            const companyId = this.getCompanyId(req);
            const dto: ICreateOfferLetterDto = req.body;

            if (!dto.applicationId || !dto.designation || !dto.department) {
                throw new AppError("applicationId, designation, and department are required");
            }
            if (!dto.joiningDate || !dto.expiresAt) {
                throw new AppError("joiningDate and expiresAt are required");
            }
            if (!dto.compensation?.baseSalary) {
                throw new AppError("compensation.baseSalary is required");
            }

            const offer = await this.offerService.createOffer(companyId, dto);

            return ApiResponse.success(res, "Offer letter sent successfully", offer);
        } catch (error) {
            next(error);
        }
    }

    async listOffers(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        try {
            const companyId = this.getCompanyId(req);
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as string | undefined;

            const { offers, paginationMeta } = await this.offerService.getCompanyOffers(companyId, page, limit, status);

            return ApiResponse.success(res, "Offers fetched successfully", offers, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

    async getOffer(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        try {
            const companyId = this.getCompanyId(req);
            const id = req.params.id;
            if (!id || typeof id !== "string") {
                throw new ValidationError("Invalid id");
            }
            const offer = await this.offerService.getOfferForCompany(id, companyId);

            return ApiResponse.success(res, "Offer fetched successfully", offer);
        } catch (error) {
            next(error);
        }
    }

    async verifyOffer(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        try {
            const companyId = this.getCompanyId(req);
            const verifiedBy = req.user?.id ?? companyId;
            const id = req.params.id;
            if (!id || typeof id !== "string") {
                throw new ValidationError("Invalid id");
            }
            const offer = await this.offerService.verifyOffer(id, companyId, verifiedBy);

            return ApiResponse.success(res, "Offer verified successfully", offer);
        } catch (error) {
            next(error);
        }
    }

    async downloadPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const companyId = this.getCompanyId(req);
            const id = req.params.id;
            if (!id || typeof id !== "string") {
                throw new ValidationError("Invalid id");
            }
            const buffer = await this.offerService.generateOfferPdf(id, companyId, "company");

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=offer-letter.pdf");
            res.setHeader("Content-Length", buffer.length.toString());
            res.send(buffer);
        } catch (error) {
            next(error);
        }
    }

    async getSignedDocument(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        try {
            const companyId = this.getCompanyId(req);
            const id = req.params.id;
            if (!id || typeof id !== "string") {
                throw new ValidationError("Invalid id");
            }
            const url = await this.offerService.getSignedDocumentUrl(id, companyId);

            return ApiResponse.success(res, "Signed document fetched successfully", { url });
        } catch (error) {
            next(error);
        }
    }
}
