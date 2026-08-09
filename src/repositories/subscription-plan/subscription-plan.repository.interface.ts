import { ISubscriptionPlan } from "../../models/subscription-plan/subscription.interface";
import { IBaseRepository } from "../base-repository/base.repository.inteface";

export interface ISubscriptionPlanRepository extends IBaseRepository<ISubscriptionPlan> {
    findActivePlans(): Promise<ISubscriptionPlan[]>;
    getPlansByPriceRange(minPrice: number, maxPrice: number): Promise<ISubscriptionPlan[]>;
    findByName(name: string): Promise<ISubscriptionPlan | null>;
    findFreePlan(): Promise<ISubscriptionPlan | null>;
    updatePlanFeatures(id: string, features: Partial<ISubscriptionPlan["features"]>): Promise<ISubscriptionPlan | null>;
    updatePlanLimits(id: string, limits: Partial<ISubscriptionPlan["limits"]>): Promise<ISubscriptionPlan | null>;
    toggleActiveStatus(id: string): Promise<ISubscriptionPlan | null>;
}
