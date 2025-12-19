import express from "express";
import { userAuthMiddleware } from "../../middlewares/user.auth.middleware";
import { userProfileController } from "../../dependencies/container.dependency";
import { upload } from "../../middlewares/multer.middleware";

 const userRoutes = express.Router();

userRoutes.get("/me", userAuthMiddleware, userProfileController.getUserProfile.bind(userProfileController));
userRoutes.patch("/me", userAuthMiddleware, userProfileController.updateUserProfile.bind(userProfileController));
userRoutes.delete(
    "/me/profile-picture",
    userAuthMiddleware,
    userProfileController.deleteProfilePicture.bind(userProfileController)
);
userRoutes.post(
    "/me/profile-picture",
    userAuthMiddleware,
    upload.single("profilePicture"),
    userProfileController.updateProfilePicture.bind(userProfileController)
);
userRoutes.post(
    "/me/userEducation",
    userAuthMiddleware,
    userProfileController.updateProfilePicture.bind(userProfileController)
);
userRoutes.patch(
    "/me/userEducation",
    userAuthMiddleware,
    userProfileController.updateProfilePicture.bind(userProfileController)
);
userRoutes.delete(
    "/me/userEducation",
    userAuthMiddleware,
    userProfileController.updateProfilePicture.bind(userProfileController)
);

export default userRoutes;
