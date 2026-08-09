import { ISkill } from "../../../models/skill/skill.interface";
import { PaginationMeta } from "../../../utils/apiResponse.utils";

export interface ISkillServivce {
    createSkill(name: string, description: string): Promise<ISkill>;

    getSkillsPaginated(page: number, limit: number, search: string): Promise<[ISkill[], PaginationMeta]>;

    getSkillById(skillId: string): Promise<ISkill | null>;

    updateSkill(skillId: string, data: Partial<ISkill>): Promise<ISkill | null>;

    blockOrUnblockSkill(skillId: string): Promise<ISkill | null>;

    deleteSkill(skillId: string): Promise<boolean>;
}
