import express from "express";
import { companySubscriptionPaymentController } from "../dependencies/container.dependency";
const webhookRoutes = express.Router();

webhookRoutes.post(
    "/stripe",
    companySubscriptionPaymentController.handleWebhook.bind(companySubscriptionPaymentController),
);


export default webhookRoutes;