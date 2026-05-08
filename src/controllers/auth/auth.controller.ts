import { Request, Response } from "express";
import { IAuthService } from "../../services/auth/auth.service.interface";
import { ICacheService } from "../../services/cache/cache.service.interface";
import {
    refreshTokenCookieName,
    refreshTokenCookieOptions,
    accessTokenCookieName,
    accessTokenCookieOptions,
} from "../../utils/cookies.utils";
import { IAuthController } from "./auth.controller.interface";
import { companySignupData, userSignupData } from "../../utils/auth.utils";
import { ApiResponse } from "../../utils/apiResponse.utils";
import { AuthUserResponseDTO } from "../../dtos/auth.dto";
import {
    cachedUserValidator,
    LoginRequestDTO,
    EmailAndRoleDTO,
    CheckAvailabilityDTO,
    RequestOtpDTO,
    ResendOtpDTO,
    VerifyOtpDTO,
    ForgotPasswordDTO,
    ResetPasswordDTO,
    GoogleLoginDTO,
    AuthCookiesDTO,
    CachedUserData,
} from "../../validators-schemas/auth.schemas";
import { HTTP_MESSAGES } from "../../constants/messages/http.messages.constants";
import { asyncHandler } from "../../utils/asyncHandler";

export class AuthController implements IAuthController {
    constructor(private _authService: IAuthService, private _cacheService: ICacheService) {}

    refresh = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken: oldRefreshToken } = req.cookies as AuthCookiesDTO;

        const { refreshToken, accessToken, user } = await this._authService.refresh(oldRefreshToken);

        res.cookie(refreshTokenCookieName, refreshToken, refreshTokenCookieOptions);
        res.cookie(accessTokenCookieName, accessToken, accessTokenCookieOptions);

        return ApiResponse.success<AuthUserResponseDTO>(res, HTTP_MESSAGES.TOKEN_REFRESH_SUCCESSFULL, user);
    });

    login = asyncHandler(async (req: Request, res: Response) => {
        const { email, password, role } = req.body as LoginRequestDTO;

        const { refreshToken, accessToken, user } = await this._authService.login(email, password, role);

        res.cookie(refreshTokenCookieName, refreshToken, refreshTokenCookieOptions);
        res.cookie(accessTokenCookieName, accessToken, accessTokenCookieOptions);

        return ApiResponse.success<AuthUserResponseDTO>(res, HTTP_MESSAGES.LOGIN_SUCCESSFULL, user);
    });

    google = asyncHandler(async (req: Request, res: Response) => {
        const { credential, role } = req.body as GoogleLoginDTO;

        const { refreshToken, accessToken, user } = await this._authService.loginWithGoogle(credential, role);

        res.cookie(refreshTokenCookieName, refreshToken, refreshTokenCookieOptions);
        res.cookie(accessTokenCookieName, accessToken, accessTokenCookieOptions);

        return ApiResponse.success(res, HTTP_MESSAGES.GOOGLE_AUTH_SUCCESS, { user });
    });

    logout = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.cookies as AuthCookiesDTO;

        if (refreshToken) {
            await this._authService.logout(refreshToken as string);
        }

        res.clearCookie(refreshTokenCookieName, refreshTokenCookieOptions);
        res.clearCookie(accessTokenCookieName, accessTokenCookieOptions);

        return ApiResponse.success(res, HTTP_MESSAGES.LOGOUT_SUCCESSFULL);
    });

    signup = asyncHandler(async (req: Request, res: Response) => {
        const { email } = req.body as EmailAndRoleDTO;

        const jsonCachedUserData = await this._cacheService.get(email);
        if (!jsonCachedUserData) {
            return ApiResponse.error(res, HTTP_MESSAGES.SESSION_EXPIRED);
        }

        // Keep this inner try-catch: JSON.parse is synchronous and throws a
        // SyntaxError on bad data — not a domain error, so we handle it locally
        // rather than letting it propagate to the global error handler as a 500.
        let cachedUserData: CachedUserData;
        try {
            cachedUserData = JSON.parse(jsonCachedUserData as string);
        } catch {
            return ApiResponse.error(res, HTTP_MESSAGES.INVALID_SESSION_DATA);
        }

        const validatedCache = cachedUserValidator.safeParse(cachedUserData);
        if (!validatedCache.success) {
            return ApiResponse.validationError(
                res,
                HTTP_MESSAGES.TAMPERED_SESSION_DATA,
                validatedCache.error.flatten().fieldErrors,
            );
        }

        if (!validatedCache.data.otpVerified) {
            return ApiResponse.error(res, HTTP_MESSAGES.OTP_VERIFICATION_REQUIRED);
        }

        const entity =
            validatedCache.data.role === "user"
                ? await this._authService.signupUser(validatedCache.data as userSignupData)
                : await this._authService.signupCompany(validatedCache.data as companySignupData);

        await this._cacheService.delete(email);

        return ApiResponse.created(res, HTTP_MESSAGES.REGISTRATION_SUCCESSFULL, {
            email: entity.email,
            role: validatedCache.data.role,
        });
    });

    checkUserPhoneOrEmailExists = asyncHandler(async (req: Request, res: Response) => {
        const { phoneOrEmail, role } = req.body as CheckAvailabilityDTO;

        const result = await this._authService.checkPhoneOrEmailExists(phoneOrEmail, role);

        return ApiResponse.success(res, "", result);
    });

    requestOTP = asyncHandler(async (req: Request, res: Response) => {
        const userData = req.body as RequestOtpDTO;

        await this._authService.sendOtpCacheUser(userData);

        return ApiResponse.success(res, HTTP_MESSAGES.OTP_SENT, {
            email: userData.email,
            role: userData.role,
        });
    });

    resendOTP = asyncHandler(async (req: Request, res: Response) => {
        const { email, role } = req.body as ResendOtpDTO;

        await this._authService.resendOtp(email);

        return ApiResponse.success(res, HTTP_MESSAGES.OTP_SENT, { email, role });
    });

    verifyOTP = asyncHandler(async (req: Request, res: Response) => {
        const { otp, email, role } = req.body as VerifyOtpDTO;

        const verificationStatus = await this._authService.verifyOtp(otp, email);

        if (verificationStatus) {
            return ApiResponse.success(res, HTTP_MESSAGES.OTP_VERIFICATION_SUCCESSFULL, { email, role });
        }

        return ApiResponse.error(res, HTTP_MESSAGES.OTP_VERIFICATION_FAILED);
    });

    forgotPassword = asyncHandler(async (req: Request, res: Response) => {
        const { email, role } = req.body as ForgotPasswordDTO;

        await this._authService.sendResetPasswordLink(email, role);

        return ApiResponse.success(res, HTTP_MESSAGES.PASSWORD_RESET_LINK_SENT);
    });

    resetPassword = asyncHandler(async (req: Request, res: Response) => {
        const { newPassword, resetPasswordToken } = req.body as ResetPasswordDTO;

        await this._authService.resetPassword(resetPasswordToken, newPassword);

        return ApiResponse.created(res, HTTP_MESSAGES.PASSWORD_RESET_SUCCESSFULL);
    });
}
