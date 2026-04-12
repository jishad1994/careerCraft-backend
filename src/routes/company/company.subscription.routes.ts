import express from "express";
import {
    companySubscriptionController,
    companySubscriptionPaymentController,
    invoiceController,
} from "../../dependencies/container.dependency";
import { companyAuthMiddleware } from "../../middlewares/company.auth.middleware";

const companySubscriptionRoutes = express.Router();

companySubscriptionRoutes.get(
    "/queue",
    companyAuthMiddleware,
    companySubscriptionController.getSubscriptionQueue.bind(companySubscriptionController),
);
companySubscriptionRoutes.get(
    "/active",
    companyAuthMiddleware,
    companySubscriptionController.getActiveSubscription.bind(companySubscriptionController),
);
companySubscriptionRoutes.get(
    "/:subscriptionId/invoice",
    companyAuthMiddleware,
    invoiceController.getInvoiceBySubscription.bind(invoiceController),
);

companySubscriptionRoutes.get(
    "/plans",
    companyAuthMiddleware,
    companySubscriptionController.getPlans.bind(companySubscriptionController),
);

companySubscriptionRoutes.get(
    "/plans/:planId",
    companyAuthMiddleware,
    companySubscriptionController.getPlanById.bind(companySubscriptionController),
);

companySubscriptionRoutes.get(
    "/remaining-limits",
    companyAuthMiddleware,
    companySubscriptionController.getRemainingLimits.bind(companySubscriptionController),
);

companySubscriptionRoutes.post(
    "/cancel",
    companyAuthMiddleware,
    companySubscriptionController.cancelSubscription.bind(companySubscriptionController),
);
companySubscriptionRoutes.post(
    "/",
    companyAuthMiddleware,
    companySubscriptionPaymentController.createPaymentIntentAndSubscribe.bind(companySubscriptionPaymentController),
);
companySubscriptionRoutes.post(
    "/payments/confirm",
    companyAuthMiddleware,
    companySubscriptionPaymentController.confirmPaymentAndActivateSubscription.bind(companySubscriptionPaymentController),
);

companySubscriptionRoutes.post(
    "/payments",
    companyAuthMiddleware,
    companySubscriptionPaymentController.retryPayment.bind(companySubscriptionPaymentController),
);
companySubscriptionRoutes.get(
    "/payments/:paymentId",
    companyAuthMiddleware,
    companySubscriptionPaymentController.getPaymentById.bind(companySubscriptionPaymentController),
);
companySubscriptionRoutes.get(
    "/payments/:intentId",
    companyAuthMiddleware,
    companySubscriptionPaymentController.getPaymentStatus.bind(companySubscriptionPaymentController),
);

companySubscriptionRoutes.post(
    "/upgrade",
    companyAuthMiddleware,
    companySubscriptionController.upgradeSubscription.bind(companySubscriptionController), //not using currently
);

export default companySubscriptionRoutes;
