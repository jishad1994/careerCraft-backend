import express from "express";
import { companyJobApplicationController } from "../../dependencies/container.dependency";

export const companyApplicationRoutes = express.Router();

companyApplicationRoutes.get(
    "/",
    companyJobApplicationController.getCompanyApplications.bind(companyJobApplicationController)
);
companyApplicationRoutes.get(
    "/:id",
    companyJobApplicationController.getApplicationById.bind(companyJobApplicationController)
);
companyApplicationRoutes.get(
    "/:id/update-status",
    companyJobApplicationController.updateApplicationStatus.bind(companyJobApplicationController)
);
companyApplicationRoutes.get(
    "/:id/mark-viewed",
    companyJobApplicationController.markAsViewed.bind(companyJobApplicationController)
);
companyApplicationRoutes.get(
    "/:id/add-notes",
    companyJobApplicationController.markAsViewed.bind(companyJobApplicationController)
);

export default companyApplicationRoutes;
