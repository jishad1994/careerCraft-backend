import express from "express";
import { companyProfileController } from "../../dependencies/container.dependency";
import { upload } from "../../middlewares/multer.middleware";
const companyProfileRoutes = express.Router();

companyProfileRoutes.get("/", companyProfileController.getProfile.bind(companyProfileController));
companyProfileRoutes.put(
    "/",

    companyProfileController.updateBasicProfile.bind(companyProfileController),
);
companyProfileRoutes.post(
    "/profile-picture",
    upload.single("profilePicture"),
    companyProfileController.updateProfilePicture.bind(companyProfileController),
);
companyProfileRoutes.put("/addresses", companyProfileController.updateAddress.bind(companyProfileController));

companyProfileRoutes.delete(
    "/profile-picture",
    companyProfileController.deleteProfilePicture.bind(companyProfileController),
);
companyProfileRoutes.post(
    "/banner-image",
    upload.single("bannerImage"),
    companyProfileController.updateBannerImage.bind(companyProfileController),
);
companyProfileRoutes.delete("/banner-image", companyProfileController.deleteBannerImage.bind(companyProfileController));
companyProfileRoutes.post(
    "/documents",
    upload.single("document"),
    companyProfileController.uploadDocument.bind(companyProfileController),
);
companyProfileRoutes.delete("/documents", companyProfileController.deleteDocument.bind(companyProfileController));

companyProfileRoutes.patch("/reapply-verification", companyProfileController.reapplyForVerification.bind(companyProfileController));

export default companyProfileRoutes;
