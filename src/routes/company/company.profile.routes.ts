import express from "express";
import { companyProfileController } from "../../dependencies/container.dependency";
import { companyAuthMiddleware } from "../../middlewares/company.auth.middleware";
const companyProfileRoutes = express.Router();

companyProfileRoutes.get("/", companyAuthMiddleware, companyProfileController.getProfile.bind(companyProfileController));

export default companyProfileRoutes;
