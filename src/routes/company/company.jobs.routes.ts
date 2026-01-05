import express from "express";
import { companyJobController } from "../../dependencies/container.dependency";
import { companyAuthMiddleware } from "../../middlewares/company.auth.middleware";

const companyJobRoutes = express.Router();

// Create job
companyJobRoutes.post("/", companyAuthMiddleware, companyJobController.createJob.bind(companyJobController));

// Get all company jobs
companyJobRoutes.get("/", companyAuthMiddleware, companyJobController.getCompanyJobs.bind(companyJobController));

// Get single job
companyJobRoutes.get("/:jobId", companyAuthMiddleware, companyJobController.getJobById.bind(companyJobController));

// Update job
companyJobRoutes.put("/:jobId", companyAuthMiddleware, companyJobController.updateJob.bind(companyJobController));

// Update job status
companyJobRoutes.patch(
    "/:jobId/status",
    companyAuthMiddleware,
    companyJobController.updateJobStatus.bind(companyJobController)
);

// Delete job (soft delete)
companyJobRoutes.delete("/:jobId", companyAuthMiddleware, companyJobController.deleteJob.bind(companyJobController));

export default companyJobRoutes;
