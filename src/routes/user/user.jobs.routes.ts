import express from "express";
import { userJobController } from "../../dependencies/container.dependency";
import { userAuthMiddleware } from "../../middlewares/user.auth.middleware";

export const userJobRoutes = express.Router();

userJobRoutes.get("/search", userJobController.searchJobs.bind(userJobController));

userJobRoutes.get("/:jobId", userJobController.getJobById.bind(userJobController));

userJobRoutes.get("/slug/:slug", userJobController.getJobBySlug.bind(userJobController));

userJobRoutes.post("/:jobId/apply", userAuthMiddleware, userJobController.applyForJob.bind(userJobController));

export default userJobRoutes;
