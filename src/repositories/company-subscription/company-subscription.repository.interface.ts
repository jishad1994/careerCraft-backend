import {
    companySubscriptionUsageTypes,
    IAddon,
    ICompanySubscription,
    SubscriptionStatus,
} from "../../models/company-subscription/company-subscription.interface";
import { IBaseRepository } from "../base-repository/base.repository.inteface";

export interface ICompanySubscriptionRepository extends IBaseRepository<ICompanySubscription> {
    create(data: Partial<ICompanySubscription>): Promise<ICompanySubscription>;

    findActiveByCompany(companyId: string): Promise<ICompanySubscription | null>;

    findByCompany(companyId: string): Promise<ICompanySubscription[]>;

    findExpired(): Promise<ICompanySubscription[]>;

    updateStatus(id: string, status: SubscriptionStatus): Promise<ICompanySubscription | null>;

    cancel(id: string, reason: string): Promise<ICompanySubscription | null>;

    incrementUsage(id: string, type: companySubscriptionUsageTypes): Promise<ICompanySubscription | null>;

    findQueuedByCompany(companyId: string): Promise<ICompanySubscription[]>;

    findReadyToActivate(): Promise<ICompanySubscription[]>;

    addAddon(subscriptionId: string, addon: IAddon): Promise<void>;
}
