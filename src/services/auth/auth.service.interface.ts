import { ICompany } from "../../models/company/company.interface";
import { IUser } from "../../models/user/user.interface";
import { signupData } from "../../utils/auth.utils";

export interface IAuthService {
    signupUser(
        userData: signupData
    ): Promise<{ user: Partial<IUser | ICompany>; accessToken: string; refreshToken?: string }>;

    login(email: string, password: string, role: string): Promise<{ accessToken: string; refreshToken: string }>;

    logout(refreshToken: string): Promise<void>;

    refresh(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;

    sendOtpAndCacheTheUser(user: signupData): Promise<void>;

    resendOtp(email: string): Promise<void>;

    verifyOtp(otp: string, email: string): Promise<boolean>;

    checkPhoneOrEmailExists(emailOrPhone: string, role: string): Promise<{ exists: boolean } | null>;

    sendResetPassworLink(email: string, role: string): Promise<void>;


    resetPassword(email: string, role: string, newPassword: string): Promise<void>;
}
