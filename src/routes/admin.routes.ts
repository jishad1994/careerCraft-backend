import express from "express";
import { adminController } from "../dependencies/container.dependency";

export const adminRoutes = express.Router();

adminRoutes.get("/getUsersPaginated", adminController.getUsersPaginated.bind(adminController));
adminRoutes.get("/getCompaniesPaginated", adminController.getCompaniesPaginated.bind(adminController));
adminRoutes.get("/getCompanies", adminController.getCompanies.bind(adminController));
adminRoutes.get("/getUsers", adminController.getUsers.bind(adminController));
adminRoutes.patch("/comapanies/:id/block", adminController.blockCompany.bind(adminController));
adminRoutes.patch("/comapanies/:id/unblock", adminController.unblockCompany.bind(adminController));
adminRoutes.patch("/users/:id/block", adminController.blockUser.bind(adminController));
adminRoutes.patch("/users/:id/unblock", adminController.unblockUser.bind(adminController));

export default adminRoutes;
