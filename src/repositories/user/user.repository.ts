import { IUser } from "../../models/user/user.interface";
import { IUserRepository } from "./user.repository.interface";
import { BaseRepository } from "../base-repository/base.repository";
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

    async addSkill(userId: string, skillId: string): Promise<IUser | null> {
        return this.model.findByIdAndUpdate(userId, { $addToSet: { skills: skillId } }, { new: true }).exec();
    }

    async removeSkill(userId: string, skillId: string): Promise<IUser | null> {
        return this.model.findByIdAndUpdate(userId, { $pull: { skills: skillId } }, { new: true }).exec();
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

    async findPaginated(page: number, limit: number, search?: string): Promise<[IUser[], number]> {
        page = Math.max(page, 1);
        limit = Math.min(Math.max(limit, 1), 50);

        const skip = (page - 1) * limit;

        const escapedSearch = search ? search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
        const filter = {
            role: "user",
            $or: [
                { email: { $regex: escapedSearch, $options: "i" } },
                { name: { $regex: escapedSearch, $options: "i" } },
                { lastName: { $regex: escapedSearch, $options: "i" } },
            ],
        };

        const [data, total] = await Promise.all([
            this.model
                .find(filter, { firstName: 1, lastName: 1, email: 1, role: 1, isBlocked: 1 })
                .lean()
                .skip(skip)
                .limit(limit),
            this.model.countDocuments(filter),
        ]);

        return [data, total];
    }

    async blockOrUnblock(id: string, flag: boolean): Promise<IUser | null> {
        try {
            return await super.findByIdAndUpdate(id, { isBlocked: flag });
        } catch {
            throw new DataBaseError("db error while blck or unblock user");
        }
    }
}
