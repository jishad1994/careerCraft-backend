import { IUser } from "../../models/user/user.interface";
export interface IUserRepo {
    createUser(user: Partial<IUser>): Promise<Partial<IUser>>;

    findByEmailOrPhone(emailOrPhone: string): Promise<IUser | null>;

}
