import express from "express";
import { userJobController } from "../../dependencies/container.dependency";
import { upload } from "../../middlewares/multer.middleware";

export const userJobRoutes = express.Router();

userJobRoutes.get("/search", userJobController.searchJobs.bind(userJobController));

userJobRoutes.get("/:jobId", userJobController.getJobById.bind(userJobController));

userJobRoutes.get("/slug/:slug", userJobController.getJobBySlug.bind(userJobController));

userJobRoutes.post(
    "/apply",
    upload.single("coverLetter"),
    // validate(applyJobSchema, ["body"]),
    userJobController.applyForJob.bind(userJobController)
);

export default userJobRoutes;
