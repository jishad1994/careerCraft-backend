import { IUser } from "../../models/user/user.interface";
import { IUserRepo } from "../../repositories/user/user.Repository.interface";
import bcrypt from "bcrypt";
import { IUserAuthService } from "./user.auth.service.interface";

export class UserAuthService implements IUserAuthService {
    private userRepo: IUserRepo;

    constructor(userRepo: IUserRepo) {
        this.userRepo = userRepo;
    }

    //signup user
    async signupUser(
        firstName: string,

        lastName: string,
        email: string,
        phone: string,
        password: string
    ): Promise<Partial<IUser>> {
        const existingUser = await this.userRepo.findByEmailOrPhone(email);

        if (existingUser) {
            throw new Error("user already existing with current Email");
        }

        return await this.userRepo.createUser({ firstName, lastName, email, phone, password });
    }

    
    //check phone number/Email taken or not
    async checkPhoneOrEmailExists(phoneOrEmail: string): Promise<{ exists: boolean } | null> {
        let user = await this.userRepo.findByEmailOrPhone(phoneOrEmail);
        return { exists: !!user };
    }
}
