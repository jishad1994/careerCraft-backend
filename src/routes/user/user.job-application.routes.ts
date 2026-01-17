import express from "express";
import { userJobApplicationController } from "../../dependencies/container.dependency";

const userJobApplicationRoutes = express.Router();

userJobApplicationRoutes.get("/", userJobApplicationController.getUserApplications.bind(userJobApplicationController));

userJobApplicationRoutes.get("/:id", userJobApplicationController.getApplicationById.bind(userJobApplicationController));

userJobApplicationRoutes.patch("/:id", userJobApplicationController.withdrawApplication.bind(userJobApplicationController));

userJobApplicationRoutes.get(
    "/get-status/:jobId",
    userJobApplicationController.checkApplicationStatus.bind(userJobApplicationController)
);

export default userJobApplicationRoutes;
