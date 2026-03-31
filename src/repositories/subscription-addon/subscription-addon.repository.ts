import { Model } from "mongoose";
import { ISubscriptionAddon } from "../../models/subscription-add-on/addon.interface";
import { BaseRepository } from "../base-repository/base.repository";
import { ISubscriptionAddonRepository } from "./subscription-addon.repository.interface";

export class SubscriptionAddonRepository extends BaseRepository<ISubscriptionAddon>
    implements ISubscriptionAddonRepository {
    constructor(model: Model<ISubscriptionAddon>) {
        super(model);
    }

    async findActiveByType(type: string): Promise<ISubscriptionAddon[]> {
        return this.model
            .find({
                type,
                isActive: true,
            })
            .sort({ quantity: 1, price: 1 })
            .lean();
    }

    async findAllActive(): Promise<ISubscriptionAddon[]> {
        return this.model
            .find({
                isActive: true,
            })
            .sort({ type: 1, quantity: 1 });
    }
}
