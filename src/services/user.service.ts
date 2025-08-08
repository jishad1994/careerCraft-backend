import { stringify } from "querystring";
import { IUser } from "../models/user/user.interface";
import { UserRepo } from "../repositories/user.repository";
import bcrypt from "bcrypt";

const userRepo = new UserRepo();
export class UserService {
    //signup
    async signup(
        firstName: string,
        lastName: string,
        email: string,
        phone: string,
        password: string
    ): Promise<Partial<IUser>> {
        const existingUser = await userRepo.findByEmail(email);

        if (existingUser) {
            throw new Error("user already existing with curent Email");
        }

        const hashedPassword: string = await bcrypt.hash(password, 10); //hash password

        return await userRepo.createUser({ firstName, lastName, email, phone, password: hashedPassword });
    }
}
