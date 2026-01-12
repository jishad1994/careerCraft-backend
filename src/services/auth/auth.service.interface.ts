import { userSignupData, companySignupData } from "../../utils/auth.utils";
import {  AuthUserResponseDTO } from "../../dtos/auth.dto";
import { IUser, Role } from "../../models/user/user.interface";
import { ICompany } from "../../models/company/company.interface";
import { RequestOtpDTO } from "../../validators-schemas/auth.schemas";

export interface IAuthService {
    signupUser(userData: userSignupData): Promise<IUser>;
    signupCompany(userData: companySignupData): Promise<ICompany>;

    login(
        email: string,
        password: string,
        role: string
    ): Promise<{ accessToken: string; refreshToken: string; user: AuthUserResponseDTO }>;

    loginWithGoogle(
        credential: string,
        role: Role
    ): Promise<{ accessToken: string; refreshToken: string; user: AuthUserResponseDTO }>;

    logout(refreshToken: string): Promise<void>;

    refresh(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string; user: AuthUserResponseDTO }>;

    sendOtpCacheUser(user: RequestOtpDTO): Promise<void>;

    resendOtp(email: string): Promise<void>;

    verifyOtp(otp: string, email: string): Promise<boolean>;

    checkPhoneOrEmailExists(emailOrPhone: string, role: string): Promise<{ exists: boolean } | null>;

    sendResetPasswordLink(email: string, role: string): Promise<void>;

    resetPassword(resetPasswordToken: string, newPassword: string): Promise<void>;
}
