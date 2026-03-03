import mongoose from "mongoose";
import { ISkill } from "../../../models/skill/skill.interface";
import { ISkillRepository } from "../../../repositories/skill/skill.repository.interface";
import { PaginationMeta } from "../../../utils/apiResponse.utils";
import { ISkillServivce } from "../interfaces/skills.services.interfaces";
import { ValidationError } from "../../../errors-classes/validation.error";
import { AppError } from "../../../errors-classes/app.error.";

export class SkillsService implements ISkillServivce {
    constructor(private _skillRepository: ISkillRepository) {}

    async createSkill(name: string, description: string): Promise<ISkill> {
        const existingSkill = await this._skillRepository.findOne({ name });

        if (existingSkill) {
            throw new ValidationError("Skill already exists", 409);
        }

        return await this._skillRepository.create({ name, description });
    }

    async getSkillsPaginated(page: number, limit: number, search: string): Promise<[ISkill[], PaginationMeta]> {
        const [skills, total] = await this._skillRepository.searchPaginated(page, limit, search);
        const totalPages = Math.ceil(total / limit);

        const paginationMeta: PaginationMeta = {
            page,
            limit,
            totalItems: total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };

        return [skills, paginationMeta];
    }

    async getSkillById(skillId: string): Promise<ISkill | null> {
        if (!mongoose.Types.ObjectId.isValid(skillId)) {
            throw new ValidationError("Invalid skill id");
        }

        return await this._skillRepository.findById(skillId);
    }

    async updateSkill(skillId: string, data: Partial<ISkill>): Promise<ISkill | null> {
        if (!mongoose.Types.ObjectId.isValid(skillId)) {
            throw new ValidationError("Invalid skill id");
        }

        return await this._skillRepository.findByIdAndUpdate(skillId, data);
    }

    async blockOrUnblockSkill(skillId: string): Promise<ISkill | null> {
        if (!mongoose.Types.ObjectId.isValid(skillId)) {
            throw new ValidationError("Invalid skill id");
        }
        const skill = await this._skillRepository.findById(skillId);
        if (!skill) {
            throw new AppError("Skill not found");
        }

        skill.blocked = !skill.blocked;

        await skill.save();

        return skill;
    }

    async deleteSkill(skillId: string): Promise<boolean> {
        return await this._skillRepository.delete(skillId);
    }
}
