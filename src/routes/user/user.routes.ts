import express from "express";
import userProfileRoutes from "./user.profile.routes";
import userJobRoutes from "./user.jobs.routes";
import userJobApplicationRoutes from "./user.job-application.routes";
import { userAuthMiddleware } from "../../middlewares/user.auth.middleware";

const userRoutes = express.Router();

userRoutes.use("/me",userAuthMiddleware, userProfileRoutes);
userRoutes.use("/jobs",userAuthMiddleware, userJobRoutes);
userRoutes.use("/applications", userAuthMiddleware,userJobApplicationRoutes);

export default userRoutes;
