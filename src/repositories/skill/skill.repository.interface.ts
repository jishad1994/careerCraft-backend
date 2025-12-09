import { IBaseRepository } from "../base-repository/base.repository.inteface";
import { ISkill } from "../../models/skill/skill.interface";

export interface ISkillRepository extends IBaseRepository<ISkill> {
    searchPaginated(page: number, limit: number, search: string): Promise<[ISkill[], number] >;
}
