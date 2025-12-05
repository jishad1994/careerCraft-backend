import express from "express";
import { userAuthMiddleware } from "../../middlewares/user.auth.middleware";
import { userProfileController } from "../../dependencies/container.dependency";

export const userRoutes = express.Router();

userRoutes.get("/me", userAuthMiddleware, userProfileController.getProfile.bind(userProfileController));

export default userRoutes;
