import { ISubscriptionPlan } from "../../../models/subscription-plan/subscription.interface";

export interface ISubscriptionPlanServce {
    createPlan(planData: ISubscriptionPlan): Promise<ISubscriptionPlan>;

    getAllPlans(): Promise<ISubscriptionPlan[]>;

    getActivePlans(): Promise<ISubscriptionPlan[]>;

    getPlanById(planId: string): Promise<ISubscriptionPlan | null>;

    getPlanByName(planName: string): Promise<ISubscriptionPlan>;

    updatePlanLimits(id: string, limits: Partial<ISubscriptionPlan["limits"]>): Promise<ISubscriptionPlan>;

    updatePlanFeatures(id: string, limits: Partial<ISubscriptionPlan["features"]>): Promise<ISubscriptionPlan>;

    deletePlan(planId: string): Promise<void>;

    togglePlanStatus(id: string): Promise<ISubscriptionPlan>;

    updatePlan(planId: string, planData: ISubscriptionPlan): Promise<ISubscriptionPlan>;

    getPlansByPriceRange(minPrice: number, maxPrice: number): Promise<ISubscriptionPlan[]>;
}
