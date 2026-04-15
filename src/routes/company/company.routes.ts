import express from "express";
import companyProfileRoutes from "./company.profile.routes";
import companyJobRoutes from "./company.jobs.routes";
import companyApplicationRoutes from "./company.applications.routes";
import { companyAuthMiddleware } from "../../middlewares/company.auth.middleware";
import companySubscriptionRoutes from "./company.subscription.routes";
import candidateRoutes from "./company.candidates.routes";
import companyInvoiceRoutes from "./company.invoice.routes";
import companyAddonRoutes from "./company.addons.routes";
import companyOfferLetterRoutes from "./company.offerLetter.routes";

export const companyRoutes = express.Router();

companyRoutes.use("/me", companyAuthMiddleware, companyProfileRoutes);

companyRoutes.use("/jobs", companyAuthMiddleware, companyJobRoutes);

companyRoutes.use("/applications", companyAuthMiddleware, companyApplicationRoutes);

companyRoutes.use("/subscriptions", companySubscriptionRoutes);

companyRoutes.use("/candidates", candidateRoutes);

companyRoutes.use("/invoices", companyInvoiceRoutes);

companyRoutes.use("/addons", companyAddonRoutes);

companyRoutes.use("/offers", companyOfferLetterRoutes);

export default companyRoutes;
