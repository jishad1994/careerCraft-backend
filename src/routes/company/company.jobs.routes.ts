import express from "express";
import { companyJobController } from "../../dependencies/container.dependency";
import { companyAuthMiddleware } from "../../middlewares/company.auth.middleware";

const companyJobRoutes = express.Router();

companyJobRoutes.post("/", companyAuthMiddleware, companyJobController.createJob.bind(companyJobController));

companyJobRoutes.get("/", companyAuthMiddleware, companyJobController.getCompanyJobs.bind(companyJobController));

companyJobRoutes.get(
    "/statistics",
    companyAuthMiddleware,
    companyJobController.getJobStatistics.bind(companyJobController)
);

companyJobRoutes.get("/search-skills", companyAuthMiddleware, companyJobController.searchSkills.bind(companyJobController));

companyJobRoutes.get("/:jobId", companyAuthMiddleware, companyJobController.getJobById.bind(companyJobController));

companyJobRoutes.put("/:jobId", companyAuthMiddleware, companyJobController.updateJob.bind(companyJobController));

companyJobRoutes.patch(
    "/:jobId/status",
    companyAuthMiddleware,
    companyJobController.updateJobStatus.bind(companyJobController)
);

companyJobRoutes.delete("/:jobId", companyAuthMiddleware, companyJobController.deleteJob.bind(companyJobController));

export default companyJobRoutes;
