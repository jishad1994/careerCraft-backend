import { IUser } from "../../models/user/user.interface";
import { IUserRepo } from "../../repositories/user/user.Repository.interface";
import bcrypt from "bcrypt";
import { IUserAuthService } from "./user.auth.service.interface";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../../utils/jwt.utils";
import { IRefreshTokenRepository } from "../../repositories/refreshToken/refreshToken.repository.interface";
import { userSignupData } from "../../utils/auth.utils";
import { Role } from "../../models/user/user.interface";

export class UserAuthService implements IUserAuthService {
    constructor(private userRepo: IUserRepo, private refreshTokenRepo: IRefreshTokenRepository) {}

    //signup user
    async signupUser(
        userData: userSignupData
    ): Promise<{ user: Partial<IUser>; accessToken: string; refreshToken: string }> {
        const existingUser = await this.userRepo.findByEmailOrPhone(userData.email);

        if (existingUser) {
            throw new Error("user already existing with current Email");
        }

        //password already hashed while storing inside cache

        const user = await this.userRepo.createUser({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            password: userData.password,
        });

        const userRole: Role = user.role || "user";
        //creaet accessToke
        const accessToken = createAccessToken(String(user._id), userRole);

        //create refreshToken
        const { token: refreshToken, jti } = createRefreshToken(String(user._id), userRole);

        //save the refresh Token in refreshToken repo
        const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this.refreshTokenRepo.save(jti, String(user._id), userRole, String(user.email), exp);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...newUserWithoutPassword } = user;

        return { accessToken, refreshToken, user: newUserWithoutPassword };
    }

    //Login
    async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
        const user = await this.userRepo.findByEmailOrPhone(email);
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

    //check phone number/Email taken or not
    async checkPhoneOrEmailExists(phoneOrEmail: string): Promise<{ exists: boolean } | null> {
        const user = await this.userRepo.findByEmailOrPhone(phoneOrEmail);
        return { exists: !!user };
    }
}
