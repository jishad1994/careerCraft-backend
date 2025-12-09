import express from "express";
import { skillController } from "../../dependencies/container.dependency";

const skillRoutes = express.Router();

skillRoutes.post("/", skillController.createNewSkill.bind(skillController));
skillRoutes.get("/", skillController.getPaginatedSkills.bind(skillController));
skillRoutes.get("/:id", skillController.getSkillById.bind(skillController));
skillRoutes.put("/:id", skillController.updateSkill.bind(skillController));
skillRoutes.patch("/:id/toggle-block", skillController.blockOrUnblockSkill.bind(skillController));
skillRoutes.delete("/:id", skillController.deleteSkill.bind(skillController));

export default skillRoutes;
