import { userSignupData, companySignupData } from "../../utils/auth.utils";
import { AuthResponseUserDTO, GoogleAuthRequestDTO } from "../../dtos/auth.dto";
import { IUser } from "../../models/user/user.interface";
import { ICompany } from "../../models/company/company.interface";

export interface IAuthService {
    signupUser(userData: userSignupData): Promise<IUser>;
    signupCompany(userData: companySignupData): Promise<ICompany>;

    login(
        email: string,
        password: string,
        role: string
    ): Promise<{ accessToken: string; refreshToken: string; user: AuthResponseUserDTO }>;

    loginWithGoogle({
        credential,
        role,
    }: GoogleAuthRequestDTO): Promise<{ accessToken: string; refreshToken: string; user: AuthResponseUserDTO }>;

    logout(refreshToken: string): Promise<void>;

    refresh(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string; user: AuthResponseUserDTO }>;

    sendOtpAndCacheTheUser(user: userSignupData | companySignupData): Promise<void>;

    resendOtp(email: string): Promise<void>;

    verifyOtp(otp: string, email: string): Promise<boolean>;

    checkPhoneOrEmailExists(emailOrPhone: string, role: string): Promise<{ exists: boolean } | null>;

    sendResetPasswordLink(email: string, role: string): Promise<void>;

    resetPassword(resetPasswordToken: string, newPassword: string): Promise<void>;
}
