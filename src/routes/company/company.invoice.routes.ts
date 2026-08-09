import express from "express";
import { invoiceController } from "../../dependencies/container.dependency";
import { companyAuthMiddleware } from "../../middlewares/company.auth.middleware";

const companyInvoiceRoutes = express.Router();

companyInvoiceRoutes.get("/", companyAuthMiddleware, invoiceController.getCompanyInvoices.bind(invoiceController));

companyInvoiceRoutes.get(
    "/:invoiceId/download",
    companyAuthMiddleware,
    invoiceController.downloadInvoicePDF.bind(invoiceController),
);

companyInvoiceRoutes.get(
    "/:invoiceId/view",
    companyAuthMiddleware,
    invoiceController.viewInvoicePDF.bind(invoiceController),
);

export default companyInvoiceRoutes;
