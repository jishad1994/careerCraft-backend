import { Model, Document, Types, FilterQuery } from "mongoose";
import { IBaseRepository } from "./base.repository.inteface";
import { DataBaseError } from "../../errors/database.error";

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
    constructor(protected readonly model: Model<T>) {}

    //create
    async create(entity: Partial<T>): Promise<T> {
        return await this.model.create(entity);
    }

    async findByIdWithPopulate<T>(
        id: string,
        populateFields: Array<string | { path: string; select?: string }>
    ): Promise<T | null> {
        const query = this.model.findById(id);

        populateFields.forEach((field) => {
            if (typeof field == "string") {
                query.populate(field);
            } else {
                query.populate(field);
            }
        });

        return await query.lean<T>().exec();
    }

    //find by ID
    async findById(id: string): Promise<T | null> {
        try {
            return await this.model.findById(id);
        } catch {
            throw new DataBaseError("db error while findById");
        }
    }

    //find all
    async findAll(filter?:Partial<T>): Promise<T[]> {
        try {
            return await this.model.find(filter as FilterQuery<T>);
        } catch {
            throw new DataBaseError("db error while find all");
        }
    }

    //find one

    async findOne(filter: Partial<T>): Promise<T | null> {
        try {
            return await this.model.findOne(filter as FilterQuery<T>);
        } catch {
            throw new DataBaseError("db error while findOne ");
        }
    }

    //find by email
    async findByEmail(email: string): Promise<T | null> {
        try {
            return await this.model.findOne({ email });
        } catch {
            throw new DataBaseError("db error while findByEmail");
        }
    }

    //find by phone
    async findByFilter(filter: Partial<T>): Promise<T | null> {
        try {
            return await this.model.findOne(filter as FilterQuery<T>);
        } catch {
            throw new DataBaseError("db error while findbyfilter");
        }
    }

    //update
    async findByIdAndUpdate(id: string, update: Partial<T>): Promise<T | null> {
        try {
            return await this.model.findByIdAndUpdate(id, update, { new: true });
        } catch {
            throw new DataBaseError("db error while findByIdand Update");
        }
    }

    //update by email
    async updateOneByFilter(filter: Partial<T>, update: Partial<T>): Promise<T | null> {
        try {
            return await this.model.findOneAndUpdate({ filter }, update, { new: true });
        } catch {
            throw new DataBaseError("db error while update oenby filter");
        }
    }

    //delete

    async delete(id: string): Promise<boolean> {
        try {
            const result = await this.model.findByIdAndDelete(id);
            return !!result;
        } catch {
            throw new DataBaseError("db error while delte resource");
        }
    }

    //update password

    async updatePassword(userId: string | Types.ObjectId, hashedPassword: string): Promise<void> {
        try {
            await this.model.updateOne({ _id: userId }, { $set: { password: hashedPassword } });
        } catch {
            throw new DataBaseError("db error while update password");
        }
    }

    //findby google id

    async findByGoogleId(googleId: string): Promise<T | null> {
        try {
            return await this.model.findOne({ googleId });
        } catch {
            throw new DataBaseError("db error while fidnby googleid");
        }
    }

    //count
    async count(filter: Partial<T>): Promise<number> {
        try {
            return await this.model.countDocuments(filter as FilterQuery<T>);
        } catch {
            throw new DataBaseError("db error while count resource");
        }
    }
}
