import { IUser } from "../../models/user/user.interface";
import { IUserRepository } from "./user.repository.interface";
import { BaseRepository } from "../base.repository";
import { Model } from "mongoose";
import { MongoServerError } from "mongodb";
import { ConflictError } from "../../errors/conflict.error";
import { DataBaseError } from "../../errors/database.error";

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
    constructor(model: Model<IUser>) {
        super(model);
    }

    async createUser(user: Partial<IUser>) {
        try {
            const doc = await super.create(user);
            return doc.toObject();
        } catch (error: unknown) {
            if (error instanceof MongoServerError) {
                if (error.code == 11000) {
                    throw new ConflictError("dubplicate entity error whiel creating user");
                }
            }

            throw new DataBaseError("db error while creating new user");
        }
    }

 

    async findByEmailOrPhone(emailOrPhone: string): Promise<IUser | null> {
        try {
            return await this.model.findOne({
                $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
            });
        } catch {
            throw new DataBaseError("db erro while finding user by email or phone");
        }
    }

    async findByEmailAndUpdate(email: Partial<IUser>, update: Partial<IUser>) {
        try {
            return await super.updateOneByFilter(email, update);
        } catch {
            throw new DataBaseError("db error while user findEmail or phone");
        }
    }

    async findByIdAndUpdate(id: string, update: Partial<IUser>): Promise<IUser | null> {
        try {
            return super.findByIdAndUpdate(id, update);
        } catch {
            throw new DataBaseError("db error while user findByIDandUpdate");
        }
    }

    async findPaginated(page: number, limit: number): Promise<{ data: IUser[]; total: number }> {
        try {
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                this.model
                    .find({ role: "user" }, { firstName: 1, lastName: 1, email: 1, role: 1, isBlocked: 1 })
                    .skip(skip)
                    .limit(limit),
                this.model.countDocuments(),
            ]);
            return { data, total };
        } catch {
            throw new DataBaseError("db error while user find paginated");
        }
    }

    async findUsers(query: string): Promise<IUser[]> {
        try {
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
        } catch {
            throw new DataBaseError("db error whiel findUsers");
        }
    }

    async blockOrUnblock(id: string, flag: boolean): Promise<IUser | null> {
        try {
            return await super.findByIdAndUpdate(id, { isBlocked: flag });
        } catch {
            throw new DataBaseError("db error while blck or unblock user");
        }
    }
}
