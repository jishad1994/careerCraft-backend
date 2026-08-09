import express from "express";
import { adminJobController } from "../../dependencies/container.dependency";

export const adminJobRoutes = express.Router();

// Get all jobs
adminJobRoutes.get(
    "/",

    adminJobController.getAllJobs.bind(adminJobController)
);
// get job by id
adminJobRoutes.get(
    "/:id",

    adminJobController.getJobById.bind(adminJobController)
);
adminJobRoutes.get(
    "/:id/applications",

    adminJobController.getApplicationsByJob.bind(adminJobController)
);
adminJobRoutes.get(
    "/:id/applications",

    adminJobController.getApplicationsByJob.bind(adminJobController)
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
