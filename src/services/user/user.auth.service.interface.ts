import { IUser } from "../../models/user/user.interface";
import { userSignupData } from "../../utils/auth.utils";

export interface IUserAuthService {
    signupUser(userData: userSignupData): Promise<{ user: Partial<IUser>; accessToken: string; refreshToken?: string }>;

    login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }>;

    logout(refreshToken: string): Promise<void>;

    refresh(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;

    checkPhoneOrEmailExists(emailOrPhone: string): Promise<{ exists: boolean } | null>;
}
