import { Model, Document } from "mongoose";

export class BaseRepo<T extends Document> {
    constructor(protected readonly model: Model<T>) {}

    //create
    async create(entity: Partial<T>): Promise<T> {
        return await this.model.create(entity);
    }

    //find by ID

    async findById(id: string): Promise<T | null> {
        return await this.model.findById(id);
    }

    //find one

    async findOne(filter: Partial<T>): Promise<T | null> {
        return await this.model.findOne(filter);
    }

    //find by email
    async findByEmail(email: string): Promise<T | null> {
        return await this.model.findOne({ email });
    }

    //find by phone
    async findByPhone(phone: string): Promise<T | null> {
        return await this.model.findOne({ phone });
    }

    //find all
    async findAll(): Promise<T[]> {
        return await this.model.find();
    }

    //update
    async findByIdAndUpdate(id: string, update: Partial<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, update, { new: true });
    }

    //update by email
    async updateOneByFilter(filter: Partial<T>, update: Partial<T>): Promise<T | null> {
        return await this.model.findOneAndUpdate(filter, update, { new: true });
    }

    //delete

    async delete(id: string): Promise<boolean> {
        const result = await this.model.findByIdAndDelete(id);
        return !!result;
    }

    // //count
    // async count(filter: Partial<T> = {}): Promise<number> {
    //     return await this.model.countDocuments(filter);
    // }
}
