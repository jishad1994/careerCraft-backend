import { Model } from "mongoose";
import { ISkill } from "../../models/skill/skill.interface";
import { BaseRepository } from "../base-repository/base.repository";
import { ISkillRepository } from "./skill.repository.interface";

export class SkillRepository extends BaseRepository<ISkill> implements ISkillRepository {
    constructor(model: Model<ISkill>) {
        super(model);
    }

    async searchPaginated(page: number, limit: number, search?: string): Promise<[ISkill[], number]> {
        page = Math.max(page, 1);
        limit = Math.min(Math.max(limit, 1), 50);

        const escapedSearch = search ? search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
        const filter = search ? { name: { $regex: escapedSearch, $options: "i" } } : {};

        const skip = (page - 1) * limit;

        const [skills, total] = await Promise.all([
            this.model.find(filter).lean().skip(skip).limit(limit).sort({ createdAt: -1 }),
            this.model.countDocuments(filter),
        ]);

        return [skills, total];
    }
}
