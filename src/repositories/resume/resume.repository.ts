

import { Model, Types } from "mongoose";
import { BaseRepository } from "../base-repository/base.repository";
import { IResume, IResumeData } from "../../models/resume/resume.interface";
import { IResumeRepository } from "./resume.repository.interface";


export class ResumeRepository extends BaseRepository<IResume>  implements IResumeRepository{
    constructor(model: Model<IResume>) {
        super(model);
    }

    /**
     * Find the single resume draft that belongs to a user.
     * Returns `null` if the user has never saved a draft.
     */
    async findByUserId(userId: string): Promise<IResume | null> {
        return this.model.findOne({ userId: new Types.ObjectId(userId) }).exec();
    }

    /**
     * Create-or-replace the user's resume draft in a single
     * atomic operation.  `$set` replaces every content field
     * while `$setOnInsert` seeds the userId on first save.
     */
    async upsertByUserId(
        userId: string,
        data: IResumeData
    ): Promise<IResume> {
        const objectId = new Types.ObjectId(userId);

        const updated = await this.model.findOneAndUpdate(
            { userId: objectId },
            {
                $set: {
                    personalInfo: data.personalInfo,
                    summary: data.summary,
                    experience: data.experience,
                    education: data.education,
                    skills: data.skills,
                    templateId: data.templateId,
                    lastSavedAt: new Date(),
                },
                $setOnInsert: {
                    userId: objectId,
                },
            },
            {
                new: true, // return the updated document
                upsert: true, // create if absent
                runValidators: true,
            }
        );

        if (!updated) {
            throw new Error("Resume upsert returned null unexpectedly");
        }

        return updated;
    }

    /**
     * Delete the user's resume draft.
     */
    async deleteByUserId(userId: string): Promise<boolean> {
        const result = await this.model.deleteOne({
            userId: new Types.ObjectId(userId),
        });
        return result.deletedCount > 0;
    }
}