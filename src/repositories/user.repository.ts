import { IUser } from "../models/user/user.interface";
import { User } from "../models/user/user.model";

export class UserRepo {
    //create user
    async createUser(user: Partial<IUser>): Promise<Partial<IUser>> {
        const newUser = new User(user);
        return await newUser.save();
    }

    //find by email
    async findByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email });
    }
}
