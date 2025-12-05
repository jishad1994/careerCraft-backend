import express from "express";
import { companyProfileController } from "../../dependencies/container.dependency";
import { companyAuthMiddleware } from "../../middlewares/company.auth.middleware";
const companyRoutes = express.Router();

companyRoutes.post("/me", companyAuthMiddleware, companyProfileController.getProfile.bind(companyProfileController));

export default companyRoutes;
