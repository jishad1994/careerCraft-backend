import express from "express";
import { adminJobController } from "../../dependencies/container.dependency";

export const adminJobRoutes = express.Router();

// Get all jobs
adminJobRoutes.get(
    "/",

    adminJobController.getAllJobs.bind(adminJobController)
);

// Verify job
adminJobRoutes.patch(
    "/:jobId/verify",

    adminJobController.verifyJob.bind(adminJobController)
);

// Block job
adminJobRoutes.patch(
    "/:jobId/block",

    adminJobController.blockJob.bind(adminJobController)
);

// Unblock job
adminJobRoutes.patch(
    "/:jobId/unblock",

    adminJobController.unblockJob.bind(adminJobController)
);

// Delete job
adminJobRoutes.delete(
    "/:jobId",

    adminJobController.deleteJob.bind(adminJobController)
);

export default adminJobRoutes;
