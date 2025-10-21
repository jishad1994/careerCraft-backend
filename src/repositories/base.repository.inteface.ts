import { Document, Types } from "mongoose";

export interface IBaseRepository<T extends Document> {
    create(entity: Partial<T>): Promise<T>;
    findById(id: string): Promise<T | null>;
    findOne(filter:Partial<T>): Promise<T | null>;
    findByEmail(email: string): Promise<T | null>;
    findByFilter(filter: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    findByIdAndUpdate(id: string, update: Partial<T>): Promise<T | null>;
    updateOneByFilter(filter: Partial<T>, update: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
    updatePassword(userId: string | Types.ObjectId, hashedPassword: string): Promise<void>;
    findByGoogleId(googleId: string): Promise<T | null>;
    count(filter: Partial<T>): Promise<number>;
}
