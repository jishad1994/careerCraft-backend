import express from "express";
import { companyAuthMiddleware } from "../../middlewares/company.auth.middleware";
import { companyOfferLetterController } from "../../dependencies/container.dependency";

const companyOfferLetterRoutes = express.Router();

companyOfferLetterRoutes.use(companyAuthMiddleware);

companyOfferLetterRoutes.get("/", companyOfferLetterController.listOffers.bind(companyOfferLetterController));

companyOfferLetterRoutes.post("/", companyOfferLetterController.createOffer.bind(companyOfferLetterController));

companyOfferLetterRoutes.get("/:id", companyOfferLetterController.getOffer.bind(companyOfferLetterController));

companyOfferLetterRoutes.get("/:id/pdf", companyOfferLetterController.downloadPdf.bind(companyOfferLetterController));

companyOfferLetterRoutes.patch("/:id/verify", companyOfferLetterController.verifyOffer.bind(companyOfferLetterController));

companyOfferLetterRoutes.get(
    "/:id/signed-document",
    companyOfferLetterController.getSignedDocument.bind(companyOfferLetterController),
);

export default companyOfferLetterRoutes;
