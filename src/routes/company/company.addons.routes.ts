import express from "express";
import { companySubscriptionController, companySubscriptionPaymentController } from "../../dependencies/container.dependency";
import { companyAuthMiddleware } from "../../middlewares/company.auth.middleware";

const companyAddonRoutes = express.Router();

companyAddonRoutes.use(companyAuthMiddleware)
companyAddonRoutes.get('/available',companySubscriptionController.getAvailableAddons.bind(companySubscriptionController))

companyAddonRoutes.post('/confirm',companySubscriptionPaymentController.confirmAddon.bind(companySubscriptionPaymentController))

companyAddonRoutes.get('/:addonId/purchase',companySubscriptionPaymentController.purchaseAddon.bind(companySubscriptionPaymentController))

export default companyAddonRoutes