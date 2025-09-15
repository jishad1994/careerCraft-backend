import { IUser } from "../../models/user/user.interface";
import { IUserRepository } from "./user.repository.interface";
import { BaseRepository } from "../base.repository";
import { Model } from "mongoose";

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
    constructor(model: Model<IUser>) {
        super(model);
    }

    async createUser(user: Partial<IUser>) {
        const doc = await super.create(user);

        return doc.toObject();
    }

    async findByEmailOrPhone(emailOrPhone: string): Promise<IUser | null> {
        console.log("find by phone or email");

        return await this.model.findOne({
            $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
        });
    }

    async findByEmailAndUpdate(email: Partial<IUser>, update: Partial<IUser>) {
        return await super.updateOneByFilter(email, update);
    }

    async findByIdAndUpdate(id: string, update: Partial<IUser>): Promise<IUser | null> {
        return super.findByIdAndUpdate(id, update);
    }

    async findPaginated(page: number, limit: number): Promise<{ data: IUser[] | null; total: number }> {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.model
                .find({ role: "user" }, { firstName: 1, lastName: 1, email: 1, role: 1, isBlocked: 1 })
                .skip(skip)
                .limit(limit),
            this.model.countDocuments(),
        ]);
        return { data, total };
    }

    async findUsers(query: string): Promise<IUser[]> {
        let users = [];

        users = await this.model
            .find(
                {
                    $or: [
                        { email: { $regex: query, $options: "i" } },
                        { firstName: { $regex: query, $options: "i" } },
                        { lastName: { $regex: query, $options: "i" } },
                    ],
                },
                { firstName: 1, lastName: 1, email: 1, role: 1 }
            )
            .lean();
        return users;
    }

    async blockOrUnblock(id: string, flag: boolean): Promise<IUser | null> {
        return await super.findByIdAndUpdate(id, { isBlocked: flag });
    }
}
