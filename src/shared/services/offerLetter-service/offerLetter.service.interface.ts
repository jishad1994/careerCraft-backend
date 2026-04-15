import {
    ICandidateRespondDto,
    ICreateOfferLetterDto,
    IOfferLetterPopulated,
} from "../../../models/offer-letter/offerLetter.interface";
import { PaginationMeta } from "../../../utils/apiResponse.utils";

export interface IOfferLetterService {
    createOffer(companyId: string, dto: ICreateOfferLetterDto): Promise<IOfferLetterPopulated>;

    getCompanyOffers(
        companyId: string,
        page: number,
        limit: number,
        status?: string,
    ): Promise<{
        offers: IOfferLetterPopulated[];
        paginationMeta: PaginationMeta;
    }>;

    getOfferForCompany(offerId: string, companyId: string): Promise<IOfferLetterPopulated>;

    verifyOffer(offerId: string, companyId: string, verifiedByUserId: string): Promise<IOfferLetterPopulated>;

    getSignedDocumentUrl(offerId: string, companyId: string): Promise<string>;

    getCandidateOffers(
        candidateId: string,
        page: number,
        limit: number,
        status?: string,
    ): Promise<{
        offers: IOfferLetterPopulated[];
        paginationMeta: PaginationMeta;
    }>;

    getOfferForCandidate(offerId: string, candidateId: string): Promise<IOfferLetterPopulated>;

    respondToOffer(offerId: string, candidateId: string, dto: ICandidateRespondDto): Promise<IOfferLetterPopulated>;

    uploadSignedDocument(
        offerId: string,
        candidateId: string,
        file: {
            buffer: Buffer;
            originalname: string;
            mimetype: string;
        },
    ): Promise<IOfferLetterPopulated>;

    generateOfferPdf(offerId: string, requesterId: string, role: "company" | "candidate"): Promise<Buffer>;
}
