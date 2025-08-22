import { IUser } from "../../models/user/user.interface";

export interface IUserAuthService {
    signupUser(
        firstName: string,

        lastName: string,
        email: string,
        phone: string,
        password: string
    ): Promise<Partial<IUser>>;

    checkPhoneOrEmailExists(emailOrPhone: string): Promise<{ exists: boolean } | null>;
}
