import express from "express";
import { userAuthMiddleware } from "../../middlewares/user.auth.middleware";
import { userProfileController } from "../../dependencies/container.dependency";
import { upload } from "../../middlewares/multer.middleware";

const userProfileRoutes = express.Router();

userProfileRoutes.get("/", userAuthMiddleware, userProfileController.getUserProfile.bind(userProfileController));

userProfileRoutes.patch("/", userAuthMiddleware, userProfileController.updateUserProfile.bind(userProfileController));

userProfileRoutes.post("/user-skills", userAuthMiddleware, userProfileController.addUserSkill.bind(userProfileController));

userProfileRoutes.delete(
    "/user-skills/:id",
    userAuthMiddleware,
    userProfileController.removeUserSkill.bind(userProfileController)
);

userProfileRoutes.delete(
    "/profile-picture",
    userAuthMiddleware,
    userProfileController.deleteProfilePicture.bind(userProfileController)
);

userProfileRoutes.post(
    "/profile-picture",
    userAuthMiddleware,
    upload.single("profilePicture"),
    userProfileController.updateProfilePicture.bind(userProfileController)
);

userProfileRoutes.post(
    "/user-education",
    userAuthMiddleware,
    userProfileController.addEducation.bind(userProfileController)
);

userProfileRoutes.put(
    "/user-education",
    userAuthMiddleware,
    userProfileController.updateEducation.bind(userProfileController)
);

userProfileRoutes.delete(
    "/user-education/:index",
    userAuthMiddleware,
    userProfileController.deleteEducation.bind(userProfileController)
);

userProfileRoutes.post(
    "/user-experience",
    userAuthMiddleware,
    userProfileController.addExperience.bind(userProfileController)
);
userProfileRoutes.put(
    "/user-experience",
    userAuthMiddleware,
    userProfileController.updateExperience.bind(userProfileController)
);
userProfileRoutes.delete(
    "/user-experience/:index",
    userAuthMiddleware,
    userProfileController.deleteExperience.bind(userProfileController)
);

userProfileRoutes.post(
    "/resumes",
    upload.single("resume"),
    userAuthMiddleware,
    userProfileController.addResume.bind(userProfileController)
);

userProfileRoutes.post(
    "/certificates",
    upload.single("certificate"),
    userAuthMiddleware,
    userProfileController.addCertificate.bind(userProfileController)
);
userProfileRoutes.delete(
    "/resumes",
    userAuthMiddleware,
    userProfileController.deleteResume.bind(userProfileController)
);
userProfileRoutes.delete(
    "/certificates",
    userAuthMiddleware,
    userProfileController.deleteCertificate.bind(userProfileController)
);

export default userProfileRoutes;
