import { signupData } from "../../utils/auth.utils";
import { AuthUserDTO, GoogleAuthRequestDTO } from "../../dtos/auth.dto";

export interface IAuthService {
    signupUser(userData: signupData): Promise<{ user: AuthUserDTO; accessToken: string; refreshToken?: string }>;

    login(
        email: string,
        password: string,
        role: string
    ): Promise<{ accessToken: string; refreshToken: string; user: AuthUserDTO }>;
    
    loginWithGoogle({
        credential,
        role,
    }: GoogleAuthRequestDTO): Promise<{ accessToken: string; refreshToken: string; user: AuthUserDTO }>;

    logout(refreshToken: string): Promise<void>;

    refresh(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;

    sendOtpAndCacheTheUser(user: signupData): Promise<void>;

    resendOtp(email: string): Promise<void>;

    verifyOtp(otp: string, email: string): Promise<boolean>;

    checkPhoneOrEmailExists(emailOrPhone: string, role: string): Promise<{ exists: boolean } | null>;

    sendResetPasswordLink(email: string, role: string): Promise<void>;

    resetPassword(resetPasswordToken: string, newPassword: string): Promise<void>;
}

