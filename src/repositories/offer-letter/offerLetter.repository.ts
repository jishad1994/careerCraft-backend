

import { Model, Types, FilterQuery } from "mongoose";
import { BaseRepository } from "../base-repository/base.repository";
import { IOfferLetter, IOfferLetterPopulated } from "../../models/offer-letter/offerLetter.interface";
import { IOfferLetterRepository } from "./offerLetter.repository.interface";

const POPULATE_FIELDS = [
    { path: "job", select: "title slug" },
    { path: "company", select: "name email location profilePicture" },
    { path: "candidate", select: "firstName lastName email phone profilePicture" },
    { path: "application", select: "status" },
];

export class OfferLetterRepository extends BaseRepository<IOfferLetter> implements IOfferLetterRepository{
    constructor(model: Model<IOfferLetter>) {
        super(model);
    }

    /** Find a single offer by ID with populated references */
    async findByIdPopulated(id: string): Promise<IOfferLetterPopulated | null> {
        return this.model
            .findById(id)
            .populate(POPULATE_FIELDS)
            .lean<IOfferLetterPopulated>()
            .exec();
    }

    /** List offers for a company with pagination */
    async findByCompany(
        companyId: string,
        page: number,
        limit: number,
        status?: string,
    ): Promise<{ offers: IOfferLetterPopulated[]; total: number }> {
        const filter: FilterQuery<IOfferLetter> = {
            company: new Types.ObjectId(companyId),
        };
        if (status) filter.status = status;

        const [offers, total] = await Promise.all([
            this.model
                .find(filter)
                .populate(POPULATE_FIELDS)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean<IOfferLetterPopulated[]>()
                .exec(),
            this.model.countDocuments(filter),
        ]);

        return { offers, total };
    }

    /** List offers for a candidate with pagination */
    async findByCandidate(
        candidateId: string,
        page: number,
        limit: number,
        status?: string,
    ): Promise<{ offers: IOfferLetterPopulated[]; total: number }> {
        const filter: FilterQuery<IOfferLetter> = {
            candidate: new Types.ObjectId(candidateId),
        };
        if (status) filter.status = status;

        const [offers, total] = await Promise.all([
            this.model
                .find(filter)
                .populate(POPULATE_FIELDS)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean<IOfferLetterPopulated[]>()
                .exec(),
            this.model.countDocuments(filter),
        ]);

        return { offers, total };
    }

    /** Check if an active (pending/accepted) offer already exists for an application */
    async hasActiveOffer(applicationId: string): Promise<boolean> {
        const count = await this.model.countDocuments({
            application: new Types.ObjectId(applicationId),
            status: { $in: ["pending", "accepted"] },
        });
        return count > 0;
    }

    /** Update status and return populated document */
    async updateStatusById(
        id: string,
        update: Partial<IOfferLetter>,
    ): Promise<IOfferLetterPopulated | null> {
        const updated = await this.model
            .findByIdAndUpdate(id, { $set: update }, { new: true })
            .populate(POPULATE_FIELDS)
            .lean<IOfferLetterPopulated>()
            .exec();

        return updated;
    }
}