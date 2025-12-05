import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../../constants/http.constants";
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
import { IUser } from "../../models/user/user.interface";
import { ICompany } from "../../models/company/company.interface";
import { ApiResponse } from "../../utils/apiResponse.utils";
import { AuthUserResponseDTO } from "../../dtos/auth.dto";
import {
    cachedUserValidator,
    emailAndRoleValidator,
    emailValidator,
    loginCredentialsValidator,
    LoginRequestDTO,
    SignupRequestDTO,
    signupValidator,
} from "../../validators/auth.validator";
import { AppError } from "../../errors/app.error.";
import { email } from "zod";

export class AuthController implements IAuthController {
    constructor(private _authService: IAuthService, private _cacheService: ICacheService) {}

    //refresh

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken: oldRefreshToken } = req.cookies;

            if (!oldRefreshToken) {
                return ApiResponse.unauthorized(res);
            }
            const { refreshToken, accessToken, user } = await this._authService.refresh(oldRefreshToken);
            res.cookie(refreshTokenCookieName, refreshToken, refreshTokenCookieOptions);
            res.cookie(accessTokenCookieName, accessToken, accessTokenCookieOptions);
            return ApiResponse.success<{ user: AuthUserResponseDTO }>(res, "Token refresh successfull", { user });
        } catch (error) {
            next(error);
        }
    }

    //login

    async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const result = loginCredentialsValidator.safeParse(req.body);

            if (!result.success) {
                const formattedErrors = result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                }));

                return ApiResponse.validationError(res, "invalid credentials", formattedErrors);
            }

            const credentials: LoginRequestDTO = result.data;

            const { refreshToken, accessToken, user } = await this._authService.login(
                credentials.email,
                credentials.password,
                credentials.role
            );

            res.cookie(refreshTokenCookieName, refreshToken, refreshTokenCookieOptions);
            res.cookie(accessTokenCookieName, accessToken, accessTokenCookieOptions);
            return ApiResponse.success(res, "User login successfull", { user });
        } catch (error) {
            next(error);
        }
    }

    // googlelogin

    async google(req: Request, res: Response, next: NextFunction) {
        try {
            const { credential, role } = req.body;

            const { refreshToken, accessToken, user } = await this._authService.loginWithGoogle({ credential, role });

            res.cookie(refreshTokenCookieName, refreshToken, refreshTokenCookieOptions);
            res.cookie(accessTokenCookieName, accessToken, accessTokenCookieOptions);

            return ApiResponse.success(res, "google authentication successfull", { user });
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        const { refreshToken } = req.cookies;
        try {
            await this._authService.logout(refreshToken as string);
            res.clearCookie(refreshTokenCookieName, refreshTokenCookieOptions);
            res.clearCookie(accessTokenCookieName, accessTokenCookieOptions);
            return ApiResponse.success(res, "Logout successfull");
        } catch (error) {
            next(error);
        }
    }

    //signup controller
    async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const result = emailAndRoleValidator.safeParse(req.body);

            if (!result.success) {
                const formattedErrors = result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                }));

                return ApiResponse.validationError(res, "invalid credentials", formattedErrors);
            }

            const jsonCachedUserData = await this._cacheService.get(result.data?.email);

            if (!jsonCachedUserData) {
                return ApiResponse.error(res, "Session expired, please try again later");
            }

            const cachedUserData = JSON.parse(jsonCachedUserData as string);

            const validatedCache = cachedUserValidator.safeParse(cachedUserData);

            if (!validatedCache.success) {
                const formattedErrors = validatedCache.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                }));

                return ApiResponse.validationError(res, "invalid credentials", formattedErrors);
            }

            if (!validatedCache.data?.otpVerified) {
                throw new AppError("Otp is not verifie.please try again", 400);
            }

            let entity: IUser | ICompany;

            if (validatedCache.data?.role == "user") {
                entity = await this._authService.signupUser(validatedCache.data as userSignupData);
            } else {
                entity = await this._authService.signupCompany(validatedCache.data as companySignupData);
            }

            if (entity) {
                return ApiResponse.created(res, "User registration succefull");
            } else {
                return ApiResponse.error(res, "User registration unsuccessfull");
            }
        } catch (error) {
            next(error);
        }
    }

    //check phone or email exists
    async checkUserPhoneOrEmailExists(req: Request, res: Response, next: NextFunction) {
        try {
            const { phoneOrEmail, role } = req.body;
            const result = await this._authService.checkPhoneOrEmailExists(phoneOrEmail, role); //returns an object {exists:boolean}

            return ApiResponse.success(res, "", result);
        } catch (error) {
            next(error);
        }
    }

    //send OTP controller
    async requestOTP(req: Request, res: Response, next: NextFunction) {
        try {
            const result = signupValidator.safeParse(req.body);

            if (!result.success) {
                const formattedErrors = result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                }));

                return ApiResponse.validationError(res, "Validation failed", formattedErrors);
            }

            const user: SignupRequestDTO = result.data;

            await this._authService.sendOtpAndCacheTheUser({ ...user });

            return ApiResponse.success(res, "Otp send to user email", { email: user.email, role: user.role });
        } catch (error) {
            next(error);
        }
    }
    // RESEND OTP CONTROLLER
    async resendOTP(req: Request, res: Response, next: NextFunction) {
        try {
            const result = emailValidator.safeParse(req.body);
            if (!result.success) {
                const formattedErrors = result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                }));

                return ApiResponse.validationError(res, "email validation failed", formattedErrors);
            }

            await this._authService.resendOtp(result.data?.email as string);
            return ApiResponse.success(res, "New otp sent successfully", email);
        } catch (error: unknown) {
            next(error);
        }
    }

    // verify OTP

    async verifyOTP(req: Request, res: Response) {
        try {
            const { otp, email, role } = req.body;
            if (!otp || !email) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "otp or email is not found " });
            }
            console.log("verificaiton woked");
            const verificationStatus = await this._authService.verifyOtp(otp, email);
            console.log("verificaiton status", verificationStatus);
            //response
            if (verificationStatus) {
                //send success response along with user data
                res.status(HTTP_STATUS.ACCEPTED).json({
                    success: true,
                    message: "otp verification successfull ",
                    email,
                    role,
                });
            } else {
                res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "OTP verification failed" });
            }
        } catch (error: unknown) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const result = emailAndRoleValidator.safeParse(req.body);

            if (!result.success) {
                const formattedErrors = result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                }));

                return ApiResponse.validationError(res, "invalid credentials", formattedErrors);
            }
            await this._authService.sendResetPasswordLink(result.data?.email, result.data?.role);
            return ApiResponse.success(res, "Password reset link send to user email");
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response): Promise<Response | void> {
        try {
            const { newPassword, resetPasswordToken } = req.body;

            await this._authService.resetPassword(resetPasswordToken, newPassword);
            return ApiResponse.created(res, "Password reset successfull");
            return res.status(HTTP_STATUS.ACCEPTED).json({ success: true, message: "password reset successfull" });
        } catch (error: unknown) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }
}
