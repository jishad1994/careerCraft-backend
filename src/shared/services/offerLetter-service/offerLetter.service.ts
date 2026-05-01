import { Types } from "mongoose";

import { IOfferLetterRepository } from "../../../repositories/offer-letter/offerLetter.repository.interface";
import { IFileService } from "../../../services/file-service/interfaces/file.service.interface";
import {
    ICandidateRespondDto,
    ICreateOfferLetterDto,
    IOfferLetter,
    IOfferLetterPopulated,
} from "../../../models/offer-letter/offerLetter.interface";
import { ValidationError } from "../../../errors-classes/validation.error";
import { AppError } from "../../../errors-classes/app.error.";
import { renderOfferLetterHtml } from "../../../utils/offerLetter.templates";
import { IJobApplicationRepository } from "../../../repositories/application/job-application.repository.interface";
import { IPdfGenerateService } from "../../../services/user/interfaces/PdfGeneration.service.interface";
import { IOfferLetterService } from "./offerLetter.service.interface";
import { PaginationMeta } from "../../../utils/apiResponse.utils";

interface IApplicationRef {
    _id: Types.ObjectId;
    job: Types.ObjectId;
    company: Types.ObjectId;
    applicant: Types.ObjectId;
    status: string;
}

const ELIGIBLE_STATUSES = ["shortlisted", "interviewed", "hired"];

export class OfferLetterService implements IOfferLetterService {
    constructor(
        private readonly offerRepo: IOfferLetterRepository,
        private readonly applicationRepo: IJobApplicationRepository,
        private readonly pdfService: IPdfGenerateService,

        private readonly fileUploadService: IFileService,
    ) {}

    async createOffer(companyId: string, dto: ICreateOfferLetterDto): Promise<IOfferLetterPopulated> {
        // 1. Validate application exists and belongs to this company
        const application = await this.applicationRepo.findById<IApplicationRef>(dto.applicationId);
        if (!application) {
            throw new ValidationError("Application not found", 404);
        }
        if (application.company.toString() !== companyId) {
            throw new ValidationError("Application does not belong to your company", 400);
        }

        // 2. Check application status
        if (!ELIGIBLE_STATUSES.includes(application.status)) {
            throw new AppError(`Cannot send offer. Application status must be: ${ELIGIBLE_STATUSES.join(", ")}`);
        }

        // 3. Check for existing active offer
        const hasActive = await this.offerRepo.hasActiveOffer(dto.applicationId);
        if (hasActive) {
            throw new AppError("An active offer already exists for this application");
        }

        // 4. Create offer
        const offer = await this.offerRepo.create({
            application: new Types.ObjectId(dto.applicationId),
            job: application.job,
            company: application.company,
            candidate: application.applicant,
            offerDate: new Date(),
            expiresAt: new Date(dto.expiresAt),
            designation: dto.designation,
            department: dto.department,
            joiningDate: new Date(dto.joiningDate),
            workLocation: dto.workLocation,
            workMode: dto.workMode,
            employmentType: dto.employmentType,
            compensation: dto.compensation,
            probationPeriod: dto.probationPeriod,
            additionalTerms: dto.additionalTerms,
            status: "pending",
        } as Partial<IOfferLetter>);

        // 5. Update application status to "offered"
        await this.applicationRepo.findByIdAndUpdate(dto.applicationId, {
            status: "offered",
        });

        // 6. Return populated
        const populated = await this.offerRepo.findByIdPopulated(offer._id.toString() );
        if (!populated) {
            throw new AppError("Failed to retrieve created offer");
        }

        return populated;
    }

    async getCompanyOffers(
        companyId: string,
        page: number,
        limit: number,
        status?: string,
    ): Promise<{ offers: IOfferLetterPopulated[]; paginationMeta: PaginationMeta }> {
        const { offers, total } = await this.offerRepo.findByCompany(companyId, page, limit, status);
        const totalPages = Math.ceil(total / limit);
        const paginationMeta: PaginationMeta = {
            page,
            limit,
            totalItems: total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };

        return { offers, paginationMeta };
    }

    async getOfferForCompany(offerId: string, companyId: string): Promise<IOfferLetterPopulated> {
        const offer = await this.offerRepo.findByIdPopulated(offerId);
        if (!offer) {
            throw new AppError("Offer not found");
        }
        if (offer.company._id.toString() !== companyId) {
            throw new AppError("Offer does not belong to your company");
        }
        return offer;
    }

    async verifyOffer(offerId: string, companyId: string, verifiedByUserId: string): Promise<IOfferLetterPopulated> {
        const offer = await this.getOfferForCompany(offerId, companyId);

        if (offer.status !== "accepted") {
            throw new AppError("Only accepted offers can be verified");
        }
        if (!offer.signedDocument) {
            throw new AppError("Candidate has not uploaded a signed document yet");
        }

        const updated = await this.offerRepo.updateStatusById(offerId, {
            status: "verified",
            verifiedAt: new Date(),
            verifiedBy: new Types.ObjectId(verifiedByUserId),
        } as Partial<IOfferLetter>);

        if (!updated) {
            throw new AppError("Failed to verify offer");
        }

        // Update application status
        await this.applicationRepo.findByIdAndUpdate(offer.application._id.toString(), { status: "hired" });

        return updated;
    }

    async getCandidateOffers(
        candidateId: string,
        page: number,
        limit: number,
        status?: string,
    ): Promise<{ offers: IOfferLetterPopulated[]; paginationMeta: PaginationMeta }> {
        const { offers, total } = await this.offerRepo.findByCandidate(candidateId, page, limit, status);

        const totalPages = Math.ceil(total / limit);
        const paginationMeta: PaginationMeta = {
            page,
            limit,
            totalItems: total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };

        return { offers, paginationMeta };
    }

    async getOfferForCandidate(offerId: string, candidateId: string): Promise<IOfferLetterPopulated> {
        const offer = await this.offerRepo.findByIdPopulated(offerId);
        if (!offer) {
            throw new AppError("Offer not found");
        }
        if (offer.candidate._id.toString() !== candidateId) {
            throw new AppError("This offer is not addressed to you");
        }
        return offer;
    }

    async respondToOffer(offerId: string, candidateId: string, dto: ICandidateRespondDto): Promise<IOfferLetterPopulated> {
        const offer = await this.getOfferForCandidate(offerId, candidateId);

        if (offer.status !== "pending") {
            throw new AppError("This offer has already been responded to");
        }

        if (new Date(offer.expiresAt) < new Date()) {
            throw new AppError("This offer has expired");
        }

        const update: Partial<IOfferLetter> = {
            status: dto.action === "accept" ? "accepted" : "rejected",
            respondedAt: new Date(),
        } as Partial<IOfferLetter>;

        if (dto.action === "reject" && dto.rejectionReason) {
            update.rejectionReason = dto.rejectionReason;
        }

        const updated = await this.offerRepo.updateStatusById(offerId, update);
        if (!updated) {
            throw new AppError("Failed to update offer");
        }

        // Update application status
        if (dto.action === "reject") {
            await this.applicationRepo.findByIdAndUpdate(offer.application._id.toString(), { status: "rejected" });
        }

        return updated;
    }

    async uploadSignedDocument(
        offerId: string,
        candidateId: string,
        file: { buffer: Buffer; originalname: string; mimetype: string },
    ): Promise<IOfferLetterPopulated> {
        const offer = await this.getOfferForCandidate(offerId, candidateId);

        if (offer.status !== "accepted") {
            throw new AppError("Signed document can only be uploaded for accepted offers");
        }

        const key = await this.fileUploadService.uploadBuffer(
            file.buffer,
            "offerLetters",
            file.originalname,
            file.mimetype,
        );

        const updated = await this.offerRepo.updateStatusById(offerId, {
            signedDocument: {
                fileKey: key,
                fileName: file.originalname,
                uploadedAt: new Date(),
                // signedURL: uploadResult.signedURL,
            },
        } as Partial<IOfferLetter>);

        if (!updated) {
            throw new AppError("Failed to upload signed document");
        }
        return updated;
    }

    async generateOfferPdf(offerId: string, requesterId: string, role: "company" | "candidate"): Promise<Buffer> {
        let offer: IOfferLetterPopulated;

        if (role === "company") {
            offer = await this.getOfferForCompany(offerId, requesterId);
        } else {
            offer = await this.getOfferForCandidate(offerId, requesterId);
        }

        const html = renderOfferLetterHtml(offer);
        return this.pdfService.generateOfferLetterPdf(html);
    }

    async getSignedDocumentUrl(offerId: string, companyId: string): Promise<string> {
        const offer = await this.getOfferForCompany(offerId, companyId);

        if (!offer.signedDocument?.fileKey) {
            throw new AppError("No signed document found");
        }

        return this.fileUploadService.generateSignedUrl(offer.signedDocument.fileKey);
    }
}
