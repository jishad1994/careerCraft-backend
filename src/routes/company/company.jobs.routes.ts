import express from "express";
import { companyJobApplicationController, companyJobController } from "../../dependencies/container.dependency";

const companyJobRoutes = express.Router();

companyJobRoutes.post("/", companyJobController.createJob.bind(companyJobController));

companyJobRoutes.get("/", companyJobController.getCompanyJobs.bind(companyJobController));

companyJobRoutes.get(
    "/statistics",

    companyJobController.getJobStatistics.bind(companyJobController)
);

companyJobRoutes.get("/search-skills", companyJobController.searchSkills.bind(companyJobController));

companyJobRoutes.get("/:jobId", companyJobController.getJobById.bind(companyJobController));

companyJobRoutes.put("/:jobId", companyJobController.updateJob.bind(companyJobController));

companyJobRoutes.get(
    "/:jobId/applications",
    companyJobApplicationController.getApplicationsByJob.bind(companyJobApplicationController)
);

companyJobRoutes.patch(
    "/:jobId/status",

    companyJobController.updateJobStatus.bind(companyJobController)
);

companyJobRoutes.delete("/:jobId", companyJobController.deleteJob.bind(companyJobController));

export default companyJobRoutes;
