import { Document, Types } from "mongoose";

export interface IBaseRepository<T extends Document> {
    create(entity: Partial<T>): Promise<T>;
    findById<P = T>(id: string): Promise<P | null>;
    findOne(filter: Partial<T>): Promise<T | null>;
    findByEmail(email: string): Promise<T | null>;
    findByFilter(filter: Partial<T>): Promise<T | null>;
    findAll(filter?: Partial<T>): Promise<T[]>;
    findByIdAndUpdate(id: string, update: Partial<T>): Promise<T>;
    updateOneByFilter(filter: Partial<T>, update: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
    updatePassword(userId: string | Types.ObjectId, hashedPassword: string): Promise<void>;
    findByGoogleId(googleId: string): Promise<T | null>;
    count(filter: Partial<T>): Promise<number>;
    findByIdWithPopulate<T>(
        userId: string,
        populateFields: Array<string | { path: string; select?: string }>,
    ): Promise<T | null>;
    updateMany(filter: Partial<T>, update: Partial<T>): Promise<{ modifiedCount: number; matchedCount: number }>;
}
