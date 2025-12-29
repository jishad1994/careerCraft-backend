import express from "express";
import { userAuthMiddleware } from "../../middlewares/user.auth.middleware";
import { userProfileController } from "../../dependencies/container.dependency";
import { upload } from "../../middlewares/multer.middleware";

const userRoutes = express.Router();

userRoutes.get("/me", userAuthMiddleware, userProfileController.getUserProfile.bind(userProfileController));

userRoutes.patch("/me", userAuthMiddleware, userProfileController.updateUserProfile.bind(userProfileController));

userRoutes.post("/me/user-skills", userAuthMiddleware, userProfileController.addUserSkill.bind(userProfileController));

userRoutes.delete(
    "/me/user-skills/:id",
    userAuthMiddleware,
    userProfileController.removeUserSkill.bind(userProfileController)
);

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

userRoutes.post("/me/user-education", userAuthMiddleware, userProfileController.addEducation.bind(userProfileController));

userRoutes.put("/me/user-education", userAuthMiddleware, userProfileController.updateEducation.bind(userProfileController));

userRoutes.delete(
    "/me/user-education/:index",
    userAuthMiddleware,
    userProfileController.deleteEducation.bind(userProfileController)
);

userRoutes.post("/me/user-experience", userAuthMiddleware, userProfileController.addExperience.bind(userProfileController));
userRoutes.put(
    "/me/user-experience",
    userAuthMiddleware,
    userProfileController.updateExperience.bind(userProfileController)
);
userRoutes.delete(
    "/me/user-experience/:index",
    userAuthMiddleware,
    userProfileController.deleteExperience.bind(userProfileController)
);

export default userRoutes;
