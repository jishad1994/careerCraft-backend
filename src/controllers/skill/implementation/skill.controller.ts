import { Request, Response, NextFunction } from "express";
import { ISkillController } from "../interfaces/skill.controller.interface";
import { ISkillServivce } from "../../../services/skills/interfaces/skills.services.interfaces";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { ISkill } from "../../../models/skill/skill.interface";
import { ValidationError } from "../../../errors-classes/validation.error";

export class SkillController implements ISkillController {
    constructor(private _skillService: ISkillServivce) {}

    async createNewSkill(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { name, description } = req.body;

            const skill = await this._skillService.createSkill(name, description);

            return ApiResponse.created(res, "New skill created successfully", skill);
        } catch (error) {
            next(error);
        }
    }

    async getPaginatedSkills(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const search = req.query.search as string;

            const [skills, paginationMeta] = await this._skillService.getSkillsPaginated(page, limit, search);

            return ApiResponse.success(res, "Skills fetch successfull", skills, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

    async getSkillById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const skillId = req.params.id;

            if (!skillId || typeof skillId !== "string") {
                throw new ValidationError("Invalid skillId");
            }
            const skill = await this._skillService.getSkillById(skillId);
            return ApiResponse.success<ISkill | null>(res, "Skill fetched successfully", skill);
        } catch (error) {
            next(error);
        }
    }

    async updateSkill(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const id = req.params.id;
            if (!id || typeof id !== "string") {
                throw new ValidationError("Invalid id");
            }

            const updatedSkill = await this._skillService.updateSkill(id, req.body);

            return ApiResponse.success(res, "Skill updated", updatedSkill);
        } catch (error) {
            next(error);
        }
    }

    async blockOrUnblockSkill(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const skillId = req.params.id;
            if (!skillId || typeof skillId !== "string") {
                throw new ValidationError("Invalid skillId");
            }
            const skill = await this._skillService.blockOrUnblockSkill(skillId);

            return ApiResponse.success(res, "Skill block or unblock done", skill);
        } catch (error) {
            next(error);
        }
    }

    async deleteSkill(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const skillId = req.params.id;
            if (!skillId || typeof skillId !== "string") {
                throw new ValidationError("Invalid skillId");
            }
            await this._skillService.deleteSkill(skillId);

            return ApiResponse.success(res, "Skill deleted successfully");
        } catch (error) {
            next(error);
        }
    }
}
