import mongoose from "mongoose";
import { AppError } from "../../../errors-classes/app.error.";
import { ISubscriptionPlan } from "../../../models/subscription-plan/subscription.interface";
import { ISubscriptionPlanRepository } from "../../../repositories/subscription-plan/subscription-plan.repository.interface";
import { ISubscriptionPlanServce } from "../interfaces/subscription-plan.service.interface";
import { ValidationError } from "../../../errors-classes/validation.error";
import logger from "../../../utils/logger";

export class SubscriptionPlanService implements ISubscriptionPlanServce {
    constructor(private _planRepository: ISubscriptionPlanRepository) {}

    async createPlan(planData: ISubscriptionPlan): Promise<ISubscriptionPlan> {
        const existingPlan = await this._planRepository.findByName(planData.name);
        if (existingPlan) {
            throw new AppError(`Plan with name '${planData.name}' already exists`);
        }
        if (planData.name.toLowerCase() != "free" && planData.price === 0) {
            throw new AppError("Free plan must have name free");
        }
        // Validate free plan constraints
        if (planData.name.toLowerCase() === "free" && planData.price !== 0) {
            throw new AppError("Free plan must have price of 0");
        }

        return await this._planRepository.create(planData);
    }

    async getAllPlans(): Promise<ISubscriptionPlan[]> {
        return await this._planRepository.findAll();
    }

    async getActivePlans(): Promise<ISubscriptionPlan[]> {
        return await this._planRepository.findActivePlans();
    }

    async getPlanById(planId: string): Promise<ISubscriptionPlan | null> {
        if (!mongoose.Types.ObjectId.isValid(planId)) {
            throw new ValidationError("Invalid objectId format");
        }
        const plan = await this._planRepository.findById(planId);

        logger.info('plan in repository',plan)
        if (!plan) {
            throw new AppError("No subscription plan found");
        }
        

        return plan;
    }

    async getPlanByName(planName: string): Promise<ISubscriptionPlan> {
        const plan = await this._planRepository.findByName(planName);

        if (!plan) {
            throw new AppError("No subscription plan found on the given name.");
        }

        return plan;
    }

    async deletePlan(planId: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(planId)) {
            throw new ValidationError("Invalid objectId format");
        }
        const plan = await this._planRepository.findById(planId);
        if (!plan) {
            throw new Error("Subscription plan not found");
        }

        await this._planRepository.delete(planId);
    }

    async updatePlan(planId: string, planData: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan> {
        const existingPlan = await this._planRepository.findById(planId);
        if (!existingPlan) {
            throw new Error("Subscription plan not found");
        }

        // Check for name conflicts if name is being changed
        if (planData.name && planData.name !== existingPlan.name) {
            const planWithSameName = await this._planRepository.findByName(planData.name);

            if (planWithSameName) {
                throw new Error(`Plan with name '${planData.name}' already exists`);
            }
        }

        // Validate free plan constraints
        if (
            (planData.name?.toLowerCase() === "free" || existingPlan.name.toLowerCase() === "free") &&
            planData.price !== undefined &&
            planData.price !== 0
        ) {
            throw new Error("Free plan must have price of 0");
        }

        const updatedPlan = await this._planRepository.findByIdAndUpdate(planId, planData);
        if (!updatedPlan) {
            throw new Error("Failed to update subscription plan");
        }

        return updatedPlan;
    }

    async getPlansByPriceRange(minPrice: number, maxPrice: number): Promise<ISubscriptionPlan[]> {
        if (minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
            throw new Error("Invalid price range");
        }
        return await this._planRepository.getPlansByPriceRange(minPrice, maxPrice);
    }

    async togglePlanStatus(id: string): Promise<ISubscriptionPlan> {
        const plan = await this._planRepository.toggleActiveStatus(id);
        if (!plan) {
            throw new Error("Subscription plan not found");
        }
        return plan;
    }

    async updatePlanLimits(id: string, limits: Partial<ISubscriptionPlan["limits"]>): Promise<ISubscriptionPlan> {
        const plan = await this._planRepository.updatePlanLimits(id, limits);
        if (!plan) {
            throw new AppError("Subscription plan not found");
        }
        return plan;
    }

    async updatePlanFeatures(id: string, features: Partial<ISubscriptionPlan["features"]>): Promise<ISubscriptionPlan> {
        const plan = await this._planRepository.updatePlanFeatures(id, features);
        if (!plan) {
            throw new AppError("Subscription plan not found");
        }
        return plan;
    }
}
