import express from "express";
import { userJobController } from "../../dependencies/container.dependency";
import { upload } from "../../middlewares/multer.middleware";
import { isUserBlocked } from "../../middlewares/checkUserBlocked.middleware";
import { userAuthMiddleware } from "../../middlewares/user.auth.middleware";

export const userJobRoutes = express.Router();

userJobRoutes.get("/search", userJobController.searchJobs.bind(userJobController));

userJobRoutes.get("/slug/:slug", userJobController.getJobBySlug.bind(userJobController));

userJobRoutes.get("/:jobId", userJobController.getJobById.bind(userJobController));

userJobRoutes.post(
    "/apply",
    upload.single("coverLetter"),
    userAuthMiddleware,
    isUserBlocked,
    userJobController.applyForJob.bind(userJobController),
);

export default userJobRoutes;
