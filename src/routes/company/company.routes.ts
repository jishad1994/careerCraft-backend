import express from "express";
import companyProfileRoutes from "./company.profile.routes";
import companyJobRoutes from "./company.jobs.routes";
import companyApplicationRoutes from "./company.applications.routes";
import { companyAuthMiddleware } from "../../middlewares/company.auth.middleware";

export const companyRoutes = express.Router();

companyRoutes.use("/me",companyAuthMiddleware, companyProfileRoutes);
companyRoutes.use("/jobs", companyAuthMiddleware,companyJobRoutes);
companyRoutes.use("/applications", companyAuthMiddleware, companyApplicationRoutes);

export default companyRoutes;
