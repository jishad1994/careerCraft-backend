import express from "express";
import { adminController } from "../../dependencies/container.dependency";
import adminJobRoutes from "./admin.jobs.routes";
import { AdminAuthMiddleware } from "../../middlewares/admin.auth.middleware";

export const adminRoutes = express.Router();

adminRoutes.get("/getCompanies", adminController.getCompanies.bind(adminController));
adminRoutes.get("/getUsers", adminController.getUsers.bind(adminController));
adminRoutes.patch("/companies/:id/block", adminController.blockCompany.bind(adminController));
adminRoutes.patch("/companies/:id/unblock", adminController.unblockCompany.bind(adminController));
adminRoutes.patch("/users/:id/block", adminController.blockUser.bind(adminController));
adminRoutes.patch("/users/:id/unblock", adminController.unblockUser.bind(adminController));

adminRoutes.use("/jobs",AdminAuthMiddleware,adminJobRoutes);

export default adminRoutes;
