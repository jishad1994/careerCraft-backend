import { IUser } from "../../models/user/user.interface";
import { IUserRepository } from "./user.repository.interface";
import { BaseRepository } from "../base.repository";
import { Model } from "mongoose";

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
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
        console.log("find by phone or email");
        
        return await this.model.findOne({
            $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
        });
    }

    //findByemail and update
    async findByEmailAndUpdate(email: Partial<IUser>, update: Partial<IUser>) {
        return super.updateOneByFilter(email, update);
    }

    async findByIdAndUpdate(id: string, update: Partial<IUser>): Promise<IUser | null> {
        return super.findByIdAndUpdate(id, update);
    }
}
