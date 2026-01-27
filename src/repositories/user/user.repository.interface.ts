import { IUser } from "../../models/user/user.interface";
import { Types } from "mongoose";
import { IBaseRepository } from "../base-repository/base.repository.inteface";
export interface IUserRepository extends IBaseRepository<IUser> {
    createUser(user: Partial<IUser>): Promise<IUser>;
    findByEmail(email: string): Promise<IUser | null>;
    findByEmailOrPhone(emailOrPhone: string): Promise<IUser | null>;
    
    updateOneByFilter(filter: Partial<IUser>, update: Partial<IUser>): Promise<IUser | null>;
    findOne(filter: Partial<IUser>): Promise<IUser | null>;
    updatePassword(userId: string | Types.ObjectId, hashedPassword: string): Promise<void>;
    findByGoogleId(googleId: string): Promise<IUser | null>;
    findPaginated(page: number, limit: number, search?: string): Promise<[IUser[], number]>;
    blockOrUnblock(id: string, flag: boolean): Promise<IUser | null>;
    addSkill(userId: string, skillId: string): Promise<IUser | null>;
    removeSkill(userId: string, skillId: string): Promise<IUser | null>;
}
