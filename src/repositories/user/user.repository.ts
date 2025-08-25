import { IUser } from "../../models/user/user.interface";
import { User } from "../../models/user/user.model";
import { IUserRepo } from "./user.Repository.interface";
import { BaseRepo } from "../base.repository";

import { Model } from "mongoose";

export class UserRepo extends BaseRepo<IUser> implements IUserRepo {
    constructor(model: Model<IUser>) {
        super(model);
    }

    //find user by phone
    async createUser(user: Partial<IUser>) {
        const doc = await super.create(user);
        return doc.toObject();
    }

    //find by email or phone
    async findByEmailOrPhone(emailOrPhone: string): Promise<IUser | null> {
        return await this.model.findOne({
            $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
        });
    }
}
