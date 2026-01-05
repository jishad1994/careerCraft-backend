import express from "express";
import { publicJobController } from "../../dependencies/container.dependency";

export const publicJobRoutes = express.Router();

publicJobRoutes.get("/", publicJobController.getActiveJobs.bind(publicJobController));

publicJobRoutes.get("/featured", publicJobController.getFeaturedJobs.bind(publicJobController));

export default publicJobRoutes;
