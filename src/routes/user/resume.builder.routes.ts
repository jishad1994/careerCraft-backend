// resume.routes.ts - Resume API Routes

import { Router } from "express";
import { resumeBuilderController } from "../../dependencies/container.dependency";

const resumeBuilderRouter = Router();


resumeBuilderRouter.get("/templates", resumeBuilderController.getTemplates.bind(resumeBuilderController));

resumeBuilderRouter.get("/draft", resumeBuilderController.getDraft.bind(resumeBuilderController));

resumeBuilderRouter.put("/save-draft", resumeBuilderController.saveDraft.bind(resumeBuilderController));

resumeBuilderRouter.get("/profile-data", resumeBuilderController.getProfileData.bind(resumeBuilderController));

resumeBuilderRouter.post("/generate-pdf", resumeBuilderController.generatePdf.bind(resumeBuilderController));

resumeBuilderRouter.post("/upload", resumeBuilderController.uploadResume.bind(resumeBuilderController));

export default resumeBuilderRouter;
