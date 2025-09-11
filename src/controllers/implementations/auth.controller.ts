import { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http.constants";
import { IAuthService } from "../../services/auth/auth.service.interface";
import { IOtpService } from "../../services/otp_service/otp.service.interface";
import { ICache } from "../../services/cache/cache.service.interface";
import { refreshCookieName, refreshCookieOptions } from "../../utils/cookies.utils";
import { signupData } from "../../utils/auth.utils";
import { IAuthController } from "../interfaces/auth.controller.interface";

export class AuthController implements IAuthController {
    constructor(private _authService: IAuthService, private _otpService: IOtpService, private _cacheService: ICache) {}
    //login

    async login(req: Request, res: Response): Promise<Response | void> {
        try {
            const { role, email, password } = req.body.payload;
            console.log("role:", role, "email:", email, password, "in controller");
            const { refreshToken, accessToken, user } = await this._authService.login(email, password, role);
            return res
                .cookie(refreshCookieName, refreshToken, refreshCookieOptions)
                .status(HTTP_STATUS.CREATED)
                .json({ success: true, messsage: "user registration successfull", user, accessToken });
        } catch (error) {
            console.log(error);
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ success: false, message: error instanceof Error ? error?.message : error });
        }
    }

    // googlelogin

    async google(req: Request, res: Response) {
        try {
            const { credential, role } = req.body;

            console.log(credential, role);
            const { refreshToken, accessToken, user } = await this._authService.loginWithGoogle({ credential, role });
            return res
                .cookie(refreshCookieName, refreshToken, refreshCookieOptions)
                .status(HTTP_STATUS.CREATED)
                .json({ success: true, messsage: "user registration successfull", user, accessToken });
        } catch (error: any) {
            console.log(error);
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }

    async logout(req: Request, res: Response) {
        const { refreshToken } = req.cookies;
        try {
            await this._authService.logout(String(refreshToken));
        } catch (error) {}
    }

    //signup controller
    async signup(req: Request, res: Response) {
        try {
            const { email } = req.body;
            if (!email) {
                throw new Error("invalid credentials missing");
            }

            const jsonUserData = await this._cacheService.get(email);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { otpHashed, ...userData } = JSON.parse(jsonUserData as string);
            if (!userData) {
                throw new Error("time limit exceeded.please try again");
            }

            const { accessToken, refreshToken, user } = await this._authService.signupUser(userData);

            return res
                .cookie(refreshCookieName, refreshToken, refreshCookieOptions)
                .status(HTTP_STATUS.CREATED)
                .json({ success: true, messsage: "user registration successfull", user, accessToken });
        } catch (error: unknown) {
            console.log(error);
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ success: false, message: error instanceof Error ? error?.message : error });
        }
    }

    //check phone or email exists
    async checkUserPhoneOrEmailExists(req: Request, res: Response) {
        try {
            const { phoneOrEmail, role } = req.body;
            const result = await this._authService.checkPhoneOrEmailExists(phoneOrEmail, role); //returns an object {exists:boolean}
            return res.status(HTTP_STATUS.OK).json({ success: true, message: null, ...result });
        } catch (error: unknown) {
            console.log(error);
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ success: false, message: error instanceof Error ? error?.message : error });
        }
    }

    //send OTP controller
    async requestOTP(req: Request, res: Response) {
        try {
            //sanitize data from the request body according to the role
            const { role, phone, email, password } = req.body;
            let firstName: string | undefined;
            let lastName: string | undefined;
            let name: string | undefined;
            if (role === "user") {
                ({ firstName, lastName } = req.body);
            } else {
                ({ name } = req.body);
            }

            const user: signupData =
                role == "user"
                    ? { firstName, lastName, phone, email, password, role }
                    : { name, email, phone, password, role };

            await this._authService.sendOtpAndCacheTheUser(user);
            //return response
            return res.status(200).json({ success: true, message: "OTP send to email", email, role });
        } catch (error: unknown) {
            console.log(error);
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }
    // RESEND OTP CONTROLLER
    async resendOTP(req: Request, res: Response) {
        try {
            console.log(req.body);
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ success: false, message: "Email is required" });
            }

            await this._authService.resendOtp(email as string);

            return res.status(200).json({ success: true, message: "New OTP sent successfully", email });
        } catch (error: unknown) {
            console.error(error);
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : error });
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

    async forgotPassword(req: Request, res: Response) {
        try {
            const { email, role } = req.body;
            if (!email || !role) throw new Error("email and role is required");
            await this._authService.sendResetPasswordLink(email, role);
            return res
                .status(HTTP_STATUS.ACCEPTED)
                .json({ success: true, message: "reset password link send to user email" });
        } catch (error: unknown) {
            console.log(error);

            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }

    async resetPassword(req: Request, res: Response): Promise<Response | void> {
        try {
            const { newPassword, resetPasswordToken } = req.body;

            await this._authService.resetPassword(resetPasswordToken, newPassword);
            return res.status(HTTP_STATUS.ACCEPTED).json({ success: true, message: "password reset successfull" });
        } catch (error: unknown) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }
}
