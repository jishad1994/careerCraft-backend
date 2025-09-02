import { IUser } from "../../models/user/user.interface";
import { IUserRepo } from "../../repositories/user/user.repository.interface";
import bcrypt from "bcrypt";
import { IAuthService } from "./auth.service.interface";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../../utils/jwt.utils";
import { IRefreshTokenRepository } from "../../repositories/refreshToken/refreshToken.repository.interface";
import { signupData } from "../../utils/auth.utils";
import { Role } from "../../models/user/user.interface";
import { ICache } from "../cache/cache.service.interface";
import { IOtpService } from "../otp_service/otp.service.interface";
import { ICompanyRepo } from "../../repositories/company/company.repository.interface";
import { ICompany } from "../../models/company/company.interface";

export class AuthService implements IAuthService {
    constructor(
        private userRepo: IUserRepo,
        private companyRepo: ICompanyRepo,
        private refreshTokenRepo: IRefreshTokenRepository,
        private cacheService: ICache,
        private otpService: IOtpService
    ) {}

    //signup user
    async signupUser(
        userData: signupData
    ): Promise<{ user: Partial<IUser | ICompany>; accessToken: string; refreshToken: string }> {
        const role: string = userData.role;
        const existingUser =
            userData?.role == "user"
                ? await this.userRepo.findByEmailOrPhone(userData.email as string)
                : await this.companyRepo.findByEmailOrPhone(userData.email as string);

        if (existingUser) {
            throw new Error("user already existing with current Email");
        }

        //password already hashed while storing inside cache
        const user: Partial<IUser | ICompany> =
            role == "user"
                ? await this.userRepo.createUser({
                      firstName: userData.firstName,
                      lastName: userData.lastName,
                      email: userData.email,
                      phone: userData.phone,
                      password: userData.password,
                  })
                : await this.companyRepo.createCompany({
                      name: userData.name,
                      email: userData.email,
                      phone: userData.phone,
                      password: userData.password,
                  });

        //creaet accessToke
        const accessToken = createAccessToken(String(user._id), role as Role);

        //create refreshToken
        const { token: refreshToken, jti } = createRefreshToken(String(user._id), role as Role);

        //save the refresh Token in refreshToken repo
        const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this.refreshTokenRepo.save(jti, String(user._id), role as Role, String(user.email), exp);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...newUserWithoutPassword } = user;

        return { accessToken, refreshToken, user: newUserWithoutPassword };
    }

    //Login
    async login(email: string, password: string, role: string): Promise<{ accessToken: string; refreshToken: string }> {
        const user =
            role == "user"
                ? await this.userRepo.findByEmailOrPhone(email)
                : await this.companyRepo.findByEmailOrPhone(email);
        if (!user) throw new Error("invaid credentials");

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new Error("invalid credentilas");

        const accessToken = createAccessToken(String(user._id), user.role);

        const { token: refreshToken, jti } = createRefreshToken(String(user._id), user.role);

        const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this.refreshTokenRepo.save(jti, String(user._id), user.role, user.email, exp);
        return { accessToken, refreshToken };
    }

    //issue new refreshtoken

    async refresh(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        const payload = verifyRefreshToken(oldRefreshToken);
        const record = await this.refreshTokenRepo.find(payload.jti);
        if (!record || record.role !== payload.role || record.userId !== payload.sub) {
            throw new Error("invalid refresh token");
        }

        //rotate refresh token
        await this.refreshTokenRepo.delete(payload.jti);

        const accessToken = createAccessToken(payload.sub, payload.role);

        const { jti, token: newRefreshToken } = createRefreshToken(payload.sub, payload.role);
        const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this.refreshTokenRepo.save(jti, record.userId, record.role, record.email, exp);

        return { accessToken, refreshToken: newRefreshToken };
    }

    //Logout

    async logout(refreshToken: string): Promise<void> {
        try {
            const { jti } = verifyRefreshToken(refreshToken);
            await this.refreshTokenRepo.delete(jti);
        } catch (error) {
            console.log(error);
        }
    }

    //request otp

    async sendOtpAndCacheTheUser(user: signupData) {
        //generate OTP
        const otp: string = (await this.otpService.generateOTP()).toString();

        //hash OTP
        const otpHashed: string = await bcrypt.hash(otp, 10);

        const hashedPassword: string = await bcrypt.hash(user.password ?? "", 10); //hash password

        //update user.password with hashed password
        user.password = hashedPassword;

        //save user along with hashed OTP in the cache emai id as key with 400 seconds ttl
        await this.cacheService.set((user.email as string) ?? "", JSON.stringify({ ...user, otpHashed }), 500);

        //send generated OTP

        this.otpService.sendOTP(user.email ?? "", "your one time password", otp);
    }

    async resendOtp(email: string) {
        // Get cached user data (without OTP)
        const cachedData = await this.cacheService.get(email);

        if (!cachedData) {
            throw new Error("User not found or OTP expired");
        }

        // Parse cached user
        const user = JSON.parse(cachedData as string);

        // Generate new OTP
        const newOtp: string = (await this.otpService.generateOTP()).toString();

        const newOtpHashed: string = await bcrypt.hash(newOtp, 10);

        // Update cache with new OTP
        await this.cacheService.set(email, JSON.stringify({ ...user, otpHashed: newOtpHashed }), 500);

        // Send new OTP
        this.otpService.sendOTP(email, "Your new OTP code", newOtp);
    }

    async verifyOtp(otp: string, email: string): Promise<boolean> {
        //find the stored user authentication data from the cache servie
        const jsonTempUserData: string | null = await this.cacheService.get(email as string);

        if (!jsonTempUserData) {
            throw new Error("otp has expired.please try again!!");
        }
        //parse the data to string from JSON format

        const tempUserData = JSON.parse(jsonTempUserData);
        //extract hashed otp
        const otpHashed = tempUserData.otpHashed || "";
        //find verification status

        return await bcrypt.compare(otp as string, otpHashed);
    }

    async checUserExists(emailOrPhone: string, role: string): Promise<boolean> {
        if (!emailOrPhone || !role) return false;

        const user: Partial<IUser | ICompany> | null =
            role == "user"
                ? await this.userRepo.findByEmailOrPhone(emailOrPhone)
                : await this.companyRepo.findByEmailOrPhone(emailOrPhone);

        return !!user;
    }

    async sendResetPasswordLink(email: string, role: string): Promise<void> {
        if (!email || !role) throw new Error("email or user role is not provided");

        const user = role == "user" ? this.userRepo.findByEmail(email) : this.companyRepo.findByEmail(email);
        if (!user) throw new Error("user not existing");
        //generate access token with 15 minutes expiry
        const resetPasswordToken: string = createAccessToken(email, role);

        //store the token inside the cache for 15 minutes
        await this.cacheService.set(email as string, JSON.stringify(resetPasswordToken), 500);

        //send the token along with the frontend url as query params

        await this.otpService.sendOTP(
            email as string,
            `cisit this link to reset your password http://localhost:4200/api/${role}/reset-password?token=${resetPasswordToken}`
        );

        //save user along with hashed OTP in the cache emai id as key with 500 seconds ttl
        await this.cacheService.set((email as string) ?? "", JSON.stringify({ ...user, otpHashed }), 500);
    }

    resetPassword(email: string, role: string, newPassword: string): Promise<void> {}

    //check phone number/Email taken or not
    async checkPhoneOrEmailExists(phoneOrEmail: string, role: string): Promise<{ exists: boolean } | null> {
        const user =
            role == "user"
                ? await this.userRepo.findByEmailOrPhone(phoneOrEmail)
                : await this.companyRepo.findByEmailOrPhone(phoneOrEmail);
        return { exists: !!user };
    }
}
