import { IOfferLetter, IOfferLetterPopulated } from "../../models/offer-letter/offerLetter.interface";
import { IBaseRepository } from "../base-repository/base.repository.inteface";


export interface IOfferLetterRepository extends IBaseRepository<IOfferLetter> {
    
    findByIdPopulated(id: string): Promise<IOfferLetterPopulated | null>;

   
    findByCompany(
        companyId: string,
        page: number,
        limit: number,
        status?: string
    ): Promise<{
        offers: IOfferLetterPopulated[];
        total: number;
    }>;

    
    findByCandidate(
        candidateId: string,
        page: number,
        limit: number,
        status?: string
    ): Promise<{
        offers: IOfferLetterPopulated[];
        total: number;
    }>;

   
    hasActiveOffer(applicationId: string): Promise<boolean>;

    
    updateStatusById(
        id: string,
        update: Partial<IOfferLetter>
    ): Promise<IOfferLetterPopulated | null>;
}