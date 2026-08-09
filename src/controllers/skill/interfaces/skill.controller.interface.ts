import { Request, Response, NextFunction } from "express";

export interface ISkillController {
    createNewSkill(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getPaginatedSkills(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    getSkillById(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    updateSkill(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    blockOrUnblockSkill(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

    deleteSkill(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
