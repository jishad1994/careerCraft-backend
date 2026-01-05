import express from "express";
import { companyProfileController } from "../../dependencies/container.dependency";
import { companyAuthMiddleware } from "../../middlewares/company.auth.middleware";
import { upload } from "../../middlewares/multer.middleware";
const companyProfileRoutes = express.Router();

companyProfileRoutes.get("/", companyAuthMiddleware, companyProfileController.getProfile.bind(companyProfileController));
companyProfileRoutes.put(
    "/",
    companyAuthMiddleware,
    companyProfileController.updateBasicProfile.bind(companyProfileController)
);
companyProfileRoutes.post(
    "/profile-picture",
    companyAuthMiddleware,
    upload.single("profilePicture"),
    companyProfileController.updateProfilePicture.bind(companyProfileController)
);
companyProfileRoutes.delete(
    "/profile-picture",
    companyAuthMiddleware,
    companyProfileController.deleteProfilePicture.bind(companyProfileController)
);
companyProfileRoutes.post(
    "/banner-image",
    companyAuthMiddleware,
    upload.single("bannerImage"),
    companyProfileController.updateBannerImage.bind(companyProfileController)
);
companyProfileRoutes.delete(
    "/banner-image",
    companyAuthMiddleware,
    companyProfileController.deleteBannerImage.bind(companyProfileController)
);
companyProfileRoutes.post(
    "/documents",
    companyAuthMiddleware,
    upload.single("document"),
    companyProfileController.uploadDocument.bind(companyProfileController)
);
companyProfileRoutes.delete(
    "/documents",
    companyAuthMiddleware,
    companyProfileController.deleteDocument.bind(companyProfileController)
);

export default companyProfileRoutes;
