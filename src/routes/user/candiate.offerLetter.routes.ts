import express from "express";
import { candidateOfferLetterController } from "../../dependencies/container.dependency";
import { userAuthMiddleware } from "../../middlewares/user.auth.middleware";
import { upload } from "../../middlewares/multer.middleware";

const candidateOfferLetterRoutes = express.Router();

candidateOfferLetterRoutes.use(userAuthMiddleware);

candidateOfferLetterRoutes.get("/", candidateOfferLetterController.listOffers.bind(candidateOfferLetterController));

candidateOfferLetterRoutes.get("/:id", candidateOfferLetterController.getOffer.bind(candidateOfferLetterController));

candidateOfferLetterRoutes.get("/:id/pdf", candidateOfferLetterController.downloadPdf.bind(candidateOfferLetterController));

candidateOfferLetterRoutes.patch(
    "/:id/respond",
    candidateOfferLetterController.respondToOffer.bind(candidateOfferLetterController),
);

candidateOfferLetterRoutes.post(
    "/:id/upload-signed",
    upload.single('offerLetter'),
    candidateOfferLetterController.uploadSignedDocument.bind(candidateOfferLetterController),
);

export default candidateOfferLetterRoutes;
