import express from "express";
import { subscriptionPlanController } from "../../dependencies/container.dependency";

const subscriptionPlanRoutes = express.Router();

subscriptionPlanRoutes.get("/", subscriptionPlanController.getAllPlans.bind(subscriptionPlanController));
subscriptionPlanRoutes.post("/", subscriptionPlanController.createPlan.bind(subscriptionPlanController));
subscriptionPlanRoutes.put("/:id", subscriptionPlanController.updatePlan.bind(subscriptionPlanController));
subscriptionPlanRoutes.delete("/:id", subscriptionPlanController.deletePlan.bind(subscriptionPlanController));
subscriptionPlanRoutes.patch("/:id/toggle-status", subscriptionPlanController.togglePlanStatus.bind(subscriptionPlanController));
subscriptionPlanRoutes.patch("/:id/limits", subscriptionPlanController.updatePlanLimits.bind(subscriptionPlanController));
subscriptionPlanRoutes.patch("/:id/features", subscriptionPlanController.updatePlanFeatures.bind(subscriptionPlanController));
subscriptionPlanRoutes.get("/active", subscriptionPlanController.getActivePlans.bind(subscriptionPlanController));
subscriptionPlanRoutes.get("/:id", subscriptionPlanController.getPlanById.bind(subscriptionPlanController));
subscriptionPlanRoutes.get(
    "/price-range",
    subscriptionPlanController.getPlansByPriceRange.bind(subscriptionPlanController),
);

export default subscriptionPlanRoutes;
