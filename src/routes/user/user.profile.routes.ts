import express from "express";
import { userProfileController } from "../../dependencies/container.dependency";
import { upload } from "../../middlewares/multer.middleware";

const userProfileRoutes = express.Router();

userProfileRoutes.get("/", userProfileController.getUserProfile.bind(userProfileController));

userProfileRoutes.patch("/", userProfileController.updateUserProfile.bind(userProfileController));

userProfileRoutes.post("/user-skills", userProfileController.addUserSkill.bind(userProfileController));

userProfileRoutes.delete(
    "/user-skills/:id",

    userProfileController.removeUserSkill.bind(userProfileController),
);

userProfileRoutes.delete(
    "/profile-picture",

    userProfileController.deleteProfilePicture.bind(userProfileController),
);

userProfileRoutes.post(
    "/profile-picture",

    upload.single("profilePicture"),
    userProfileController.updateProfilePicture.bind(userProfileController),
);

userProfileRoutes.post(
    "/banner-image",

    upload.single("bannerImage"),
    userProfileController.updateBannerImage.bind(userProfileController),
);

userProfileRoutes.delete("/banner-image", userProfileController.deleteBannerImage.bind(userProfileController));

userProfileRoutes.post(
    "/user-education",

    userProfileController.addEducation.bind(userProfileController),
);

userProfileRoutes.put(
    "/user-education",

    userProfileController.updateEducation.bind(userProfileController),
);

userProfileRoutes.delete(
    "/user-education/:index",

    userProfileController.deleteEducation.bind(userProfileController),
);

userProfileRoutes.post(
    "/user-experience",

    userProfileController.addExperience.bind(userProfileController),
);
userProfileRoutes.put(
    "/user-experience",

    userProfileController.updateExperience.bind(userProfileController),
);
userProfileRoutes.delete(
    "/user-experience/:index",

    userProfileController.deleteExperience.bind(userProfileController),
);

userProfileRoutes.post(
    "/resumes",
    upload.single("resume"),

    userProfileController.addResume.bind(userProfileController),
);

userProfileRoutes.post(
    "/certificates",
    upload.single("certificate"),
    userProfileController.addCertificate.bind(userProfileController),
);
userProfileRoutes.delete(
    "/resumes",

    userProfileController.deleteResume.bind(userProfileController),
);
userProfileRoutes.delete(
    "/certificates",

    userProfileController.deleteCertificate.bind(userProfileController),
);
userProfileRoutes.get(
    "/resumes/view",

    userProfileController.getResume.bind(userProfileController),
);

export default userProfileRoutes;
