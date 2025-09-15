import { IUser } from "../../models/user/user.interface";
import { Types } from "mongoose";
export interface IUserRepository {
    createUser(user: Partial<IUser>): Promise<IUser>;
    findByEmail(email: string): Promise<Partial<IUser> | null>;
    findByEmailOrPhone(emailOrPhone: string): Promise<IUser | null>;
    findById(id: string): Promise<IUser | null>;
    findByIdAndUpdate(id: string, update: Partial<IUser>): Promise<IUser | null>;
    findAll(filter: Partial<IUser>): Promise<IUser[] | null>;
    updateOneByFilter(filter: Partial<IUser>, update: Partial<IUser>): Promise<IUser | null>;
    findOne(filter: Partial<IUser>): Promise<IUser | null>;
    updatePassword(userId: string | Types.ObjectId, hashedPassword: string): Promise<void>;
    findByGoogleId(googleId: string): Promise<IUser | null>;
    findPaginated(page: number, limit: number): Promise<{ data: IUser[] | null; total: number }>;
    blockOrUnblock(id: string, flag: boolean): Promise<IUser | null>;
    findUsers(query:string): Promise<IUser[]>;
}
