import { ISubscriptionAddon } from "../../models/subscription-add-on/addon.interface";
import { IBaseRepository } from "../base-repository/base.repository.inteface";

export interface ISubscriptionAddonRepository extends IBaseRepository<ISubscriptionAddon> {
    findActiveByType(type: string): Promise<ISubscriptionAddon[]>;
    findAllActive(): Promise<ISubscriptionAddon[]>;
}
