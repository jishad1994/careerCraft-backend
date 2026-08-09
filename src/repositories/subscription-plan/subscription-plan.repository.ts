import { Model } from "mongoose";
import { ISubscriptionPlan } from "../../models/subscription-plan/subscription.interface";
import { BaseRepository } from "../base-repository/base.repository";
import { ISubscriptionPlanRepository } from "./subscription-plan.repository.interface";

export class SubscriptionPlanRepository extends BaseRepository<ISubscriptionPlan> implements ISubscriptionPlanRepository {
    constructor(model: Model<ISubscriptionPlan>) {
        super(model);
    }

    async findActivePlans(filter?: { isActive: boolean }): Promise<ISubscriptionPlan[]> {

        const query = filter ? { isActive: filter.isActive } : { isActive: true };
        return await this.model.find(query).sort({ price: 1 }).exec();
        
    }
    async getPlansByPriceRange(minPrice: number, maxPrice: number): Promise<ISubscriptionPlan[]> {
        return await this.model
            .find({ price: { $gte: minPrice, $lte: maxPrice }, isActive: true })
            .sort({ price: -1 })
            .exec();
    }

    async findByName(name: string): Promise<ISubscriptionPlan | null> {
        return await this.model.findOne({ name: { $regex: name, $options: "i" } }).exec();
    }

    async toggleActiveStatus(id: string): Promise<ISubscriptionPlan | null> {
        const plan = await this.findById(id);
        if (!plan) return null;

        plan.isActive = !plan.isActive;
        return await plan.save();
    }

    async findFreePlan(): Promise<ISubscriptionPlan | null> {
        return await this.model.findOne({ name: { $regex: "free", $options: "i" } }).exec();
    }

    async updatePlanLimits(id: string, limits: Partial<ISubscriptionPlan["limits"]>): Promise<ISubscriptionPlan | null> {
        return await this.model.findByIdAndUpdate(id, { $set: { limits } }, { new: true, runValidators: true }).exec();
    }

    async updatePlanFeatures(
        id: string,
        features: Partial<ISubscriptionPlan["features"]>,
    ): Promise<ISubscriptionPlan | null> {
        return await this.model.findByIdAndUpdate(id, { $set: { features } }, { new: true, runValidators: true }).exec();
    }
}
