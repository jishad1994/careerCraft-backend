import express from "express";
import { companyAuthMiddleware } from "../../middlewares/company.auth.middleware";
import { companyCandidateController } from "../../dependencies/container.dependency";

const candidateRoutes = express.Router();

candidateRoutes.get(
    "/:candidateId/profile",
    companyAuthMiddleware,
    companyCandidateController.getCandidateProfile.bind(companyCandidateController),
);
candidateRoutes.get(
    "/:candidateId/resumes",
    companyAuthMiddleware,
    companyCandidateController.getCandidateResumeStream.bind(companyCandidateController),
);

export default candidateRoutes;
