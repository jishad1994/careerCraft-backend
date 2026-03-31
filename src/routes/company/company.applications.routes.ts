import express from "express";
import { companyJobApplicationController } from "../../dependencies/container.dependency";

export const companyApplicationRoutes = express.Router();

/* ---------------- APPLICATION LIST ---------------- */

companyApplicationRoutes.get("/", companyJobApplicationController.getApplicantsList.bind(companyJobApplicationController));

/* ---------------- INTERVIEW ROUTES  ---------------- */

companyApplicationRoutes.get(
    "/interviews/statistics",
    companyJobApplicationController.getInterviewStats.bind(companyJobApplicationController),
);

companyApplicationRoutes.get(
    "/interviews/upcoming",
    companyJobApplicationController.getUpcomingInterviews.bind(companyJobApplicationController),
);

companyApplicationRoutes.get(
    "/interviews/:interviewId",
    companyJobApplicationController.getPopulatedInterviewById.bind(companyJobApplicationController),
);
companyApplicationRoutes.get(
    "/interviews",
    companyJobApplicationController.getAllInterviews.bind(companyJobApplicationController),
);

/* ---------------- APPLICATION INTERVIEW ACTIONS ---------------- */

companyApplicationRoutes.post(
    "/:applicationId/interviews",
    companyJobApplicationController.scheduleInterview.bind(companyJobApplicationController),
);

companyApplicationRoutes.put(
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

companyApplicationRoutes.post(
    "/:applicationId/interviews/:interviewId/update",
    companyJobApplicationController.updateInterview.bind(companyJobApplicationController),
);

/* ---------------- APPLICATION ACTIONS ---------------- */

companyApplicationRoutes.patch(
    "/:applicationId/toggle-flag",
    companyJobApplicationController.toggleFlag.bind(companyJobApplicationController),
);

companyApplicationRoutes.post(
    "/:id/update-status",
    companyJobApplicationController.updateApplicationStatus.bind(companyJobApplicationController),
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

/* ---------------- APPLICATION BY ID (LAST) ---------------- */

companyApplicationRoutes.get(
    "/:id",
    companyJobApplicationController.getApplicationById.bind(companyJobApplicationController),
);

export default companyApplicationRoutes;
