import { IUser } from "../../models/user/user.interface";
import { IUserRepository } from "../../repositories/user/user.repository.interface";
import bcrypt from "bcrypt";
import { IAuthService } from "./auth.service.interface";
import { createAccessToken, createRefreshToken, verifyAccessToken, verifyRefreshToken } from "../../utils/jwt.utils";
import { IRefreshTokenRepository } from "../../repositories/refreshToken/refreshToken.repository.interface";
import { cachedUserOrCompanyData, companySignupData, resetPasswordLink, userSignupData } from "../../utils/auth.utils";
import { Role } from "../../models/user/user.interface";
import { ICacheService } from "../cache/cache.service.interface";
import { IOtpService } from "../otp_service/otp.service.interface";
import { ICompanyRepository } from "../../repositories/company/company.repository.interface";
import { ICompany } from "../../models/company/company.interface";
import { IEmailService } from "../email_service/email.service.interface";
import { AuthUserResponseDTO } from "../../dtos/auth.dto";
import { verifyGoogleAuthToken } from "../../utils/googleAuth.utils";
import { toAuthUserResponseDTO } from "../../mappers/base-user.mapper";
import { AppError } from "../../errors/app.error.";
import { AuthError } from "../../errors/auth.error";
import logger from "../../utils/logger";
import { RequestOtpDTO } from "../../validators-schemas/auth.schemas";

export class AuthService implements IAuthService {
    constructor(
        private _userRepository: IUserRepository,
        private _companyRepository: ICompanyRepository,
        private _refreshTokenRepository: IRefreshTokenRepository,
        private _cacheService: ICacheService,
        private _otpService: IOtpService,
        private _emailService: IEmailService
    ) {}

    //signup user
    async signupUser(userData: userSignupData): Promise<IUser> {
        const existingUser = await this._userRepository.findByEmailOrPhone(userData.email as string);

        if (existingUser) {
            throw new Error("user already existing with current Email");
        }

        //password already hashed while storing inside cache
        return await this._userRepository.createUser({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            password: userData.password,
        });
    }

    //signup user
    async signupCompany(companyData: companySignupData): Promise<ICompany> {
        const existingCompany = await this._userRepository.findByEmailOrPhone(companyData.email as string);

        if (existingCompany) {
            throw new Error("company already existing with current Email");
        }

        //password already hashed while storing inside cache
        return await this._companyRepository.createCompany({
            name: companyData.name,
            email: companyData.email,
            phone: companyData.phone,
            password: companyData.password,
        });
    }

    //Login
    async login(email: string, password: string, role: string) {
        const user =
            role == "user"
                ? await this._userRepository.findOne({ email })
                : await this._companyRepository.findByEmail(email as string);

        console.log(user, "user");

        if (!user) throw new AppError("No User Found");

        const ok = await bcrypt.compare(password, user.password as string);
        if (!ok) throw new AuthError("invalid credentilas");

        const accessToken = createAccessToken(String(user._id), user.role as Role);

        const { token: refreshToken, jti } = createRefreshToken(String(user._id), user.role as Role);

        const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this._refreshTokenRepository.save(jti, String(user._id), user.role as Role, user.email as string, exp);

        const authUserDto: AuthUserResponseDTO = {
            id: String(user._id),
            role: user.role as "user" | "company" | "admin",
            email: user.email as string,
            firstName: (user as IUser).firstName,
            lastName: (user as IUser).lastName,
            name: (user as ICompany).name,
        };

        return { accessToken, refreshToken, user: authUserDto };
    }

    async loginWithGoogle(credential: string, role: Role) {
        const googleData = await verifyGoogleAuthToken(credential);

        if (!googleData.emailVerified) throw new Error("Google email is not verified");
        const googleId = googleData.sub;

        let entity =
            role == "user"
                ? await this._userRepository.findByGoogleId(googleId)
                : await this._companyRepository.findByGoogleId(googleId);
        if (entity) console.log("user already exists");

        if (!entity) {
            entity =
                role === "user"
                    ? await this._userRepository.createUser({
                          email: googleData.email,
                          role,
                          firstName: googleData.givenName,
                          lastName: googleData.familyName,
                          provider: "google",
                          googleId: googleData.sub,
                          profilePicture: googleData.picture,
                      } as IUser)
                    : await this._companyRepository.createCompany({
                          email: googleData.email,
                          name: googleData.givenName || googleData.email.split("@")[0],
                          role,
                          provider: "google",
                          googleId: googleData.sub,
                          bannerImage: googleData.picture,
                      } as ICompany);
        }
        const accessToken = createAccessToken(String(entity!._id), role);
        const { token: refreshToken, jti } = createRefreshToken(String(entity._id), role);
        const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this._refreshTokenRepository.save(jti, String(entity._id), role, entity.email as string, exp);

        const user: AuthUserResponseDTO = toAuthUserResponseDTO(entity);

        return { accessToken, refreshToken, user };
    }

    //issue new refreshtoken

    async refresh(
        oldRefreshToken: string
    ): Promise<{ accessToken: string; refreshToken: string; user: AuthUserResponseDTO }> {
        const payload = verifyRefreshToken(oldRefreshToken);
        const record = await this._refreshTokenRepository.find(payload.jti);
        if (!record || record.role !== payload.role || record.userId !== payload.sub) {
            throw new Error("invalid refresh token");
        }

        await this._refreshTokenRepository.delete(payload.jti);

        const accessToken = createAccessToken(payload.sub, payload.role);

        const userDoc =
            payload.role == "user"
                ? await this._userRepository.findById(payload.sub as string)
                : await this._companyRepository.findById(payload.sub);

        const user = userDoc as AuthUserResponseDTO;

        const { jti, token: newRefreshToken } = createRefreshToken(payload.sub, payload.role);
        const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this._refreshTokenRepository.save(jti, record.userId, record.role, record.email, exp);

        return { accessToken, refreshToken: newRefreshToken, user };
    }

    //Logout

    async logout(refreshToken: string): Promise<void> {
        try {
            const { jti } = verifyRefreshToken(refreshToken);

            console.log("jti", jti);
            await this._refreshTokenRepository.delete(jti);
        } catch (error) {
            logger.error(error);
        }
    }

    //request otp

    async sendOtpCacheUser(user: RequestOtpDTO) {
        try {
            const otp: string = (await this._otpService.generateOTP()).toString();

            logger.info(`otp generated: ${otp}`);

            const otpHashed: string = await bcrypt.hash(otp, 10);

            const hashedPassword: string = await bcrypt.hash(user.password ?? "", 10); //hash password

            user.password = hashedPassword;

            await this._cacheService.set(
                user.email,
                JSON.stringify({ ...user, otpHashed, otpVerified: false }),
                Number(process.env.OTP_VALIDATION_TIME) || 500
            );

            this._otpService.sendOTP(user.email, "Your Verification Code", otp);
            logger.info(`OTP sent and user cached for: ${user.email}`);
        } catch (error) {
            logger.error("OTP Service Error:", error);
            throw new AppError("Failed to send verification code. Please try again.");
        }
    }

    async resendOtp(email: string) {
        const jsonCachedUserData = await this._cacheService.get(email);

        if (!jsonCachedUserData) {
            throw new Error("session expired,please try again!");
        }

        const user: cachedUserOrCompanyData = JSON.parse(jsonCachedUserData as string);

        const newOtp: string = (await this._otpService.generateOTP()).toString();

        const newOtpHashed: string = await bcrypt.hash(newOtp, 10);

        user.otpHashed = newOtpHashed;

        console.log("cached userdata while resend otp", user);

        await this._cacheService.set(email, JSON.stringify({ ...user }), 500);

        this._otpService.sendOTP(email, "Your new OTP code", newOtp);
    }

    async verifyOtp(otp: string, email: string): Promise<boolean> {
        const jsonCachedUserData: string | null = await this._cacheService.get(email as string);

        if (!jsonCachedUserData) {
            throw new Error("OTP has expired.please try again!!");
        }

        const tempUserData: cachedUserOrCompanyData = JSON.parse(jsonCachedUserData);

        const otpHashed = tempUserData.otpHashed;

        const verificaitonStatus = await bcrypt.compare(otp as string, otpHashed);

        if (verificaitonStatus) {
            tempUserData.otpVerified = true;
            await this._cacheService.set(tempUserData.email, JSON.stringify({ ...tempUserData }), 300);
        }
        return verificaitonStatus;
    }

    async checUserExists(emailOrPhone: string, role: string): Promise<boolean> {
        if (!emailOrPhone || !role) return false;

        const user: Partial<IUser | ICompany> | null =
            role == "user"
                ? await this._userRepository.findByEmailOrPhone(emailOrPhone)
                : await this._companyRepository.findByEmailOrPhone(emailOrPhone);

        return !!user;
    }

    async sendResetPasswordLink(email: string, role: string): Promise<void> {
        if (!email || !role) throw new Error("email or user role is not provided");

        console.log(email, role);

        const user =
            role == "user"
                ? await this._userRepository.findByEmail(email)
                : await this._companyRepository.findByEmail(email);
        console.log(user);
        if (!user) throw new Error("user not existing");
        const resetPasswordToken: string = createAccessToken(email, role as Role);

        await this._cacheService.set(email as string, resetPasswordToken, 500);

        await this._emailService.send(
            email as string,
            "password reset link",
            "click this link to reset your password " + resetPasswordLink(role, resetPasswordToken)
        );
        console.log("reset password link", resetPasswordLink(role, resetPasswordToken));
    }

    async resetPassword(resetPasswordToken: string, newPassword: string) {
        if (!resetPasswordToken) {
            throw new Error("missing reset password token");
        }

        const { sub: email, role } = verifyAccessToken(resetPasswordToken);
        const user =
            role == "user"
                ? await this._userRepository.findByEmail(email)
                : await this._companyRepository.findByEmail(email);

        if (!user) {
            throw new Error("user does not exist");
        }

        const storedResetPasswordToken: string | null = await this._cacheService.get(email as string);

        if (!storedResetPasswordToken) {
            throw new Error("reset password token expired or time limit exceeded");
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        if (storedResetPasswordToken == resetPasswordToken) {
            if (role == "user") {
                await this._userRepository.updatePassword(String(user._id), hashedPassword);
            } else {
                await this._companyRepository.updatePassword(String(user._id), hashedPassword);
            }
            await this._cacheService.delete(email as string);
        } else {
            await this._cacheService.delete(email as string); //stop the reuse if not valid passowrd
        }
    }

    async checkPhoneOrEmailExists(phoneOrEmail: string, role: string): Promise<{ exists: boolean } | null> {
        const user =
            role == "user"
                ? await this._userRepository.findByEmailOrPhone(phoneOrEmail)
                : await this._companyRepository.findByEmailOrPhone(phoneOrEmail);
        return { exists: !!user };
    }
}
