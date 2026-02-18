import express from "express";
import { companyJobApplicationController } from "../../dependencies/container.dependency";

export const companyApplicationRoutes = express.Router();

companyApplicationRoutes.get("/", companyJobApplicationController.getApplicantsList.bind(companyJobApplicationController));
companyApplicationRoutes.get(
    "/:id",
    companyJobApplicationController.getApplicationById.bind(companyJobApplicationController),
);
companyApplicationRoutes.post(
    "/:id/update-status",
    companyJobApplicationController.updateApplicationStatus.bind(companyJobApplicationController),
);

companyApplicationRoutes.patch(
    "/:applicationId/toggle-flag",
    companyJobApplicationController.toggleFlag.bind(companyJobApplicationController),
);
companyApplicationRoutes.get(
    "/:id/mark-viewed",
    companyJobApplicationController.markAsViewed.bind(companyJobApplicationController),
);
companyApplicationRoutes.post(
    "/:id/add-notes",
    companyJobApplicationController.markAsViewed.bind(companyJobApplicationController),
);

companyApplicationRoutes.get(
    "/:id/resume",
    companyJobApplicationController.getApplicationResume.bind(companyJobApplicationController),
);

export default companyApplicationRoutes;
