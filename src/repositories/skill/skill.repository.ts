import { Model } from "mongoose";
import { ISkill } from "../../models/skill/skill.interface";
import { BaseRepository } from "../base-repository/base.repository";
import { ISkillRepository } from "./skill.repository.interface";




export class SkillRepository extends BaseRepository<ISkill> implements ISkillRepository {
    constructor(model: Model<ISkill>) {
        super(model);
    }

    async searchPaginated(page: number, limit: number, search: string): Promise<[ISkill[], number]> {
        const filter = search ? { name: { $regex: search, $options: "i" } } : {};

        const skip = (page - 1) * limit;

        const [skills, total] = await Promise.all([
            this.model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            this.model.countDocuments(filter),
        ]);

        return [skills, total];
    }
}
