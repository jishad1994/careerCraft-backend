import express from "express";
import { userAuthMiddleware } from "../../middlewares/user.auth.middleware";
import { userProfileController } from "../../dependencies/container.dependency";

export const userRoutes = express.Router();

userRoutes.get("/me", userAuthMiddleware, userProfileController.getUserProfile.bind(userProfileController));
userRoutes.patch("/me", userAuthMiddleware, userProfileController.updateUserProfile.bind(userProfileController));

export default userRoutes;
