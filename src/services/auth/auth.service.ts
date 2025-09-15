import { IUser } from "../../models/user/user.interface";
import { IUserRepository } from "../../repositories/user/user.repository.interface";
import bcrypt from "bcrypt";
import { IAuthService } from "./auth.service.interface";
import { createAccessToken, createRefreshToken, verifyAccessToken, verifyRefreshToken } from "../../utils/jwt.utils";
import { IRefreshTokenRepository } from "../../repositories/refreshToken/refreshToken.repository.interface";
import { resetPasswordLink, signupData } from "../../utils/auth.utils";
import { Role } from "../../models/user/user.interface";
import { ICache } from "../cache/cache.service.interface";
import { IOtpService } from "../otp_service/otp.service.interface";
import { ICompanyRepository } from "../../repositories/company/company.repository.interface";
import { ICompany } from "../../models/company/company.interface";
import { IEmailService } from "../email_service/email.service.interface";
import { AuthUserDTO, GoogleAuthRequestDTO } from "../../dtos/auth.dto";
import { verifyGoogleAuthToken } from "../../utils/googleAuth.utils";
import { toAuthUserResponseDTO } from "../../mappers/user.mapper";
import { Types } from "mongoose";
export class AuthService implements IAuthService {
    constructor(
        private _userRepository: IUserRepository,
        private _companyRepository: ICompanyRepository,
        private _refreshTokenRepository: IRefreshTokenRepository,
        private _cacheService: ICache,
        private _otpService: IOtpService,
        private _emailService: IEmailService
    ) {}

    //signup user
    async signupUser(userData: signupData): Promise<{ user: AuthUserDTO; accessToken: string; refreshToken: string }> {
        const role: string = userData.role;
        const existingUser =
            userData?.role == "user"
                ? await this._userRepository.findByEmailOrPhone(userData.email as string)
                : await this._companyRepository.findByEmailOrPhone(userData.email as string);

        if (existingUser) {
            throw new Error("user already existing with current Email");
        }

        //password already hashed while storing inside cache
        const entity: Partial<IUser | ICompany> =
            role == "user"
                ? await this._userRepository.createUser({
                      firstName: userData.firstName,
                      lastName: userData.lastName,
                      email: userData.email,
                      phone: userData.phone,
                      password: userData.password,
                  })
                : await this._companyRepository.createCompany({
                      name: userData.name,
                      email: userData.email,
                      phone: userData.phone,
                      password: userData.password,
                  });
        const accessToken = createAccessToken(String(entity._id), role as Role);

        const { token: refreshToken, jti } = createRefreshToken(String(entity._id), role as Role);

        //save the refresh Token in refreshToken repo
        const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this._refreshTokenRepository.save(jti, String(entity._id), role as Role, entity.email as string, exp);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const user: AuthUserDTO = toAuthUserResponseDTO(entity);

        return { user, accessToken, refreshToken };
    }

    //Login
    async login(email: string, password: string, role: string) {
        const user =
            role == "user"
                ? await this._userRepository.findByEmail(email as string)
                : await this._companyRepository.findByEmail(email as string);

        console.log(user, "user");

        if (!user) throw new Error("invaid credentials");

        const ok = await bcrypt.compare(password, user.password as string);
        if (!ok) throw new Error("invalid credentilas");

        const accessToken = createAccessToken(String(user._id), user.role as Role);

        const { token: refreshToken, jti } = createRefreshToken(String(user._id), user.role as Role);

        const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this._refreshTokenRepository.save(jti, String(user._id), user.role as Role, user.email as string, exp);

        const authUserDto: AuthUserDTO = {
            id: String(user._id),
            role: user.role as Role,
            email: user.email as string,
            firstName: (user as IUser).firstName,
            lastName: (user as IUser).lastName,
            name: (user as ICompany).name,
        };

        return { accessToken, refreshToken, user: authUserDto };
    }

    async loginWithGoogle({
        credential,
        role,
    }: GoogleAuthRequestDTO): Promise<{ accessToken: string; refreshToken: string; user: AuthUserDTO }> {
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
                      } as Partial<IUser>)
                    : await this._companyRepository.createCompany({
                          email: googleData.email,
                          name: googleData.givenName || googleData.email.split("@")[0],
                          role,
                          provider: "google",
                          googleId: googleData.sub,
                          bannerImage: googleData.picture,
                      } as Partial<ICompany>);
        }
        const accessToken = createAccessToken(String(entity!._id), role);
        const { token: refreshToken, jti } = createRefreshToken(String(entity._id), role);
        const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this._refreshTokenRepository.save(jti, String(entity._id), role, entity.email as string, exp);

        const user: AuthUserDTO = toAuthUserResponseDTO(entity);

        return { accessToken, refreshToken, user };
    }

    //issue new refreshtoken

    async refresh(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        const payload = verifyRefreshToken(oldRefreshToken);
        const record = await this._refreshTokenRepository.find(payload.jti);
        if (!record || record.role !== payload.role || record.userId !== payload.sub) {
            throw new Error("invalid refresh token");
        }

        await this._refreshTokenRepository.delete(payload.jti);

        const accessToken = createAccessToken(payload.sub, payload.role);

        const { jti, token: newRefreshToken } = createRefreshToken(payload.sub, payload.role);
        const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this._refreshTokenRepository.save(jti, record.userId, record.role, record.email, exp);

        return { accessToken, refreshToken: newRefreshToken };
    }

    //Logout

    async logout(refreshToken: string): Promise<void> {
        try {
            const { jti } = verifyRefreshToken(refreshToken);
            await this._refreshTokenRepository.delete(jti);
            
        } catch (error) {
            console.log(error);
        }
    }

    //request otp

    async sendOtpAndCacheTheUser(user: signupData) {
        //generate OTP
        const otp: string = (await this._otpService.generateOTP()).toString();

        const otpHashed: string = await bcrypt.hash(otp, 10);

        const hashedPassword: string = await bcrypt.hash(user.password ?? "", 10); //hash password

        user.password = hashedPassword;

        await this._cacheService.set((user.email as string) ?? "", JSON.stringify({ ...user, otpHashed }), 500);

        this._otpService.sendOTP(user.email ?? "", "your one time password", otp);
    }

    async resendOtp(email: string) {
        const cachedData = await this._cacheService.get(email);

        if (!cachedData) {
            throw new Error("User not found or OTP expired");
        }

        const user = JSON.parse(cachedData as string);

        const newOtp: string = (await this._otpService.generateOTP()).toString();

        const newOtpHashed: string = await bcrypt.hash(newOtp, 10);

        await this._cacheService.set(email, JSON.stringify({ ...user, otpHashed: newOtpHashed }), 500);

        this._otpService.sendOTP(email, "Your new OTP code", newOtp);
    }

    async verifyOtp(otp: string, email: string): Promise<boolean> {
        const jsonTempUserData: string | null = await this._cacheService.get(email as string);

        if (!jsonTempUserData) {
            throw new Error("otp has expired.please try again!!");
        }

        const tempUserData = JSON.parse(jsonTempUserData);
        const otpHashed = tempUserData.otpHashed || "";

        return await bcrypt.compare(otp as string, otpHashed);
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
        console.log("reset password link",resetPasswordLink(role, resetPasswordToken))
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

        console.log(storedResetPasswordToken == resetPasswordToken, "checking both pass");
        if (storedResetPasswordToken == resetPasswordToken) {
            if (role == "user") {
                console.log("inside user");
                await this._userRepository.updatePassword(user._id as string | Types.ObjectId, hashedPassword);
            } else {
                console.log("inside company");
                await this._companyRepository.updatePassword(user._id as string | Types.ObjectId, hashedPassword);
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
