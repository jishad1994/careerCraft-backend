import { IUser } from "../../models/user/user.interface";
import { IUserRepo } from "./user.repository.interface";
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

    //findByemail and update

    async findByEmailAndUpdate(email: Partial<IUser>, update: Partial<IUser>) {
        return super.updateOneByFilter(email, update);
    }
}
