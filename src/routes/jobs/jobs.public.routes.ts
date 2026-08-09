import express from "express";
import { publicJobController } from "../../dependencies/container.dependency";

export const publicJobRoutes = express.Router();

publicJobRoutes.get("/", publicJobController.getActiveJobs.bind(publicJobController));

publicJobRoutes.get("/search", publicJobController.searchJobs.bind(publicJobController));

publicJobRoutes.get("/featured", publicJobController.getFeaturedJobs.bind(publicJobController));

publicJobRoutes.get("/slug/:slug", publicJobController.getJobBySlug.bind(publicJobController));

publicJobRoutes.get("/:jobId", publicJobController.getJobById.bind(publicJobController));


export default publicJobRoutes;
