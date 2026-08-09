import express from "express";
import { adminController, adminStatsController } from "../../dependencies/container.dependency";
import adminJobRoutes from "./admin.jobs.routes";
import { AdminAuthMiddleware } from "../../middlewares/admin.auth.middleware";
import { validate } from "../../middlewares/validator.middleware";
import {
    blockUserCommentSchema,
    documentKeySchema,
    idParamSchema,
    rejectVerificationSchema,
} from "../../validators-schemas/admin.schemas";
import subscriptionPlanRoutes from "./subscription-plan.routes";

export const adminRoutes = express.Router();

// ==========================================
// 1. GLOBAL MIDDLEWARE
// ==========================================
// This protects ALL routes underneath it. No one can touch user/company data without auth.
adminRoutes.use(AdminAuthMiddleware);

// ==========================================
// 2. USER ROUTES
// ==========================================
// Specific literal path must come BEFORE parameterized path (/:id)
adminRoutes.get("/getUsers", adminController.getUsers.bind(adminController));

adminRoutes.get("/users/:id", validate(idParamSchema, ["params"]), adminController.getUserById.bind(adminController));
adminRoutes.post(
    "/users/:id/block-with-comment",
    validate(idParamSchema, ["params"]),
    validate(blockUserCommentSchema, ["body"]),
    adminController.blockUserWithComment.bind(adminController),
);
adminRoutes.patch("/users/:id/block", adminController.blockUser.bind(adminController));
adminRoutes.patch("/users/:id/unblock", adminController.unblockUser.bind(adminController));


// ==========================================
// 3. COMPANY ROUTES
// ==========================================
adminRoutes.get("/getCompanies", adminController.getCompanies.bind(adminController));

adminRoutes.get(
    "/companies/:id",
    validate(idParamSchema, ["params"]),
    adminController.getCompanyById.bind(adminController),
);
adminRoutes.patch(
    "/companies/:id/verify",
    validate(idParamSchema, ["params"]),
    adminController.verifyCompany.bind(adminController),
);
adminRoutes.post(
    "/companies/:id/reject-verification",
    validate(idParamSchema, ["params"]),
    validate(rejectVerificationSchema, ["body"]),
    adminController.rejectCompanyVerification.bind(adminController),
);
adminRoutes.patch("/companies/:id/block", adminController.blockCompany.bind(adminController));
adminRoutes.patch("/companies/:id/unblock", adminController.unblockCompany.bind(adminController));


// ==========================================
// 4. UTILITY / STATS ROUTES
// ==========================================
adminRoutes.post(
    "/documents/signed-url",
    validate(documentKeySchema, ["body"]),
    adminController.getDocumentSignedUrl.bind(adminController),
);

// AdminAuthMiddleware is removed inline here since it's applied globally above
adminRoutes.get("/stats", adminStatsController.getStats.bind(adminStatsController));


// ==========================================
// 5. SUB-ROUTERS
// ==========================================
// AdminAuthMiddleware is removed inline here as well
adminRoutes.use("/jobs", adminJobRoutes);
adminRoutes.use("/subscription-plans", subscriptionPlanRoutes);

export default adminRoutes;