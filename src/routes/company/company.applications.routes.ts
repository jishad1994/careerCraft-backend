import express from "express";
import { companyJobApplicationController } from "../../dependencies/container.dependency";

export const companyApplicationRoutes = express.Router();

companyApplicationRoutes.get("/", companyJobApplicationController.getApplicantsList.bind(companyJobApplicationController));
companyApplicationRoutes.get(
    "/:id",
    companyJobApplicationController.getApplicationById.bind(companyJobApplicationController),
);
companyApplicationRoutes.post(
    "/:id/update-status",
    companyJobApplicationController.updateApplicationStatus.bind(companyJobApplicationController),
);

companyApplicationRoutes.patch(
    "/:applicationId/toggle-flag",
    companyJobApplicationController.toggleFlag.bind(companyJobApplicationController),
);
companyApplicationRoutes.get(
    "/:id/mark-viewed",
    companyJobApplicationController.markAsViewed.bind(companyJobApplicationController),
);
companyApplicationRoutes.post(
    "/:id/add-notes",
    companyJobApplicationController.markAsViewed.bind(companyJobApplicationController),
);

companyApplicationRoutes.get(
    "/:id/resume",
    companyJobApplicationController.getApplicationResume.bind(companyJobApplicationController),
);
companyApplicationRoutes.post(
    "/:applicationId/interviews",
    companyJobApplicationController.scheduleInterview.bind(companyJobApplicationController),
);
companyApplicationRoutes.post(
    "/:applicationId/interviews/:interviewId/reschedule",
    companyJobApplicationController.rescheduleInterview.bind(companyJobApplicationController),
);
companyApplicationRoutes.put(
    "/:applicationId/interviews/:interviewId/cancel",
    companyJobApplicationController.cancelInterview.bind(companyJobApplicationController),
);

companyApplicationRoutes.put(
    "/:applicationId/interviews/:interviewId/complete",
    companyJobApplicationController.completeInterview.bind(companyJobApplicationController),
);
companyApplicationRoutes.put(
    "/:applicationId/interviews/:interviewId/complete",
    companyJobApplicationController.completeInterview.bind(companyJobApplicationController),
);
companyApplicationRoutes.post(
    "/:applicationId/interviews/:interviewId/update",
    companyJobApplicationController.updateInterview.bind(companyJobApplicationController),
);

companyApplicationRoutes.get(
    "/interviews",
    companyJobApplicationController.getAllInterviews.bind(companyJobApplicationController),
);
companyApplicationRoutes.get(
    "/interviews/:interviewId",
    companyJobApplicationController.getPopulatedInterviewById.bind(companyJobApplicationController),
);
companyApplicationRoutes.get(
    "/interviews/statistics",
    companyJobApplicationController.getInterviewStats.bind(companyJobApplicationController),
);
companyApplicationRoutes.get(
    "/interviews/upcoming",
    companyJobApplicationController.getUpcomingInterviews.bind(companyJobApplicationController),
);

export default companyApplicationRoutes;
