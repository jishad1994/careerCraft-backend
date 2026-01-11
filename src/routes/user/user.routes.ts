import express from "express";
import userProfileRoutes from "./user.profile.routes";
import userJobRoutes from "./user.jobs.routes";

const userRoutes = express.Router();

userRoutes.use("/me", userProfileRoutes);
userRoutes.use("/jobs", userJobRoutes);

export default userRoutes;
