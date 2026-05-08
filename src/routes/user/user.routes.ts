import express from "express";
import userProfileRoutes from "./user.profile.routes";
import userJobRoutes from "./user.jobs.routes";
import userJobApplicationRoutes from "./user.job-application.routes";
import { userAuthMiddleware } from "../../middlewares/user.auth.middleware";
import resumeBuilderRouter from "./resume.builder.routes";
import candidateOfferLetterRoutes from "./candiate.offerLetter.routes";
import { isUserBlocked } from "../../middlewares/checkUserBlocked.middleware";

const userRoutes = express.Router();

userRoutes.use("/me", userAuthMiddleware, isUserBlocked, userProfileRoutes);
userRoutes.use("/jobs", userAuthMiddleware, isUserBlocked, userJobRoutes);
userRoutes.use("/applications", userAuthMiddleware, isUserBlocked, userJobApplicationRoutes);
userRoutes.use("/resume", userAuthMiddleware, isUserBlocked, resumeBuilderRouter);
userRoutes.use("/offers", userAuthMiddleware, isUserBlocked, candidateOfferLetterRoutes);

export default userRoutes;
