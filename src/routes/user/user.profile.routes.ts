import express from "express";
import { userAuthMiddleware } from "../../middlewares/user.auth.middleware";
import { userProfileController } from "../../dependencies/container.dependency";
import { upload } from "../../middlewares/multer.middleware";

export const userRoutes = express.Router();

userRoutes.get("/me", userAuthMiddleware, userProfileController.getUserProfile.bind(userProfileController));
userRoutes.patch("/me", userAuthMiddleware, userProfileController.updateUserProfile.bind(userProfileController));
userRoutes.post(
    "/me/profile-picture",
    userAuthMiddleware,
    upload.single("profilePicture"),
    userProfileController.updateProfilePicture.bind(userProfileController)
);

export default userRoutes;
