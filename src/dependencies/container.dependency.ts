import { CacheService } from "../services/cache/cache.service";
import { NodeMailerService } from "../services/email_service/nodemailer.service";
import { RedisCacheRepo } from "../repositories/redis.repository";
import { OTPService } from "../services/otp_service/otp.service";
import { UserRepo } from "../repositories/user/user.repository";
import { AuthService } from "../services/auth/auth.service";
import { AuthController } from "../controllers/implementations/auth.controller";
import { User } from "../models/user/user.model";
import { RefreshTokenRepository } from "../repositories/refreshToken/refreshToken.repository";
import { CompanyRepo } from "../repositories/company/company.repository";
import { Company } from "../models/company/company.model";
//redis cache service instance
const redisRepo = new RedisCacheRepo(process.env.REDIS_URL || "redis://localhost:6379");
//cahce service
const cacheService = new CacheService(redisRepo);

//node mailer service
const nodeMailerService = new NodeMailerService(
    "gmail",
    process.env.HOST_EMAIL || "jishadkolapurath@gmail.com",
    process.env.EMAIL_PASS || "rcpd qabt rtbs xqtv"
);
//OTP service
const otpService = new OTPService(cacheService, nodeMailerService);

//user Repo
const userRepo = new UserRepo(User);

//company repo
const companyRepo = new CompanyRepo(Company);

//refresh token repo

const refreshTokenRepo = new RefreshTokenRepository(cacheService);

//user auth service
const authService = new AuthService(userRepo, companyRepo, refreshTokenRepo, cacheService, otpService);

//copmany auth service


//userAuth controller
const authController = new AuthController(authService, otpService, cacheService);

//company authcontroller

export { cacheService, nodeMailerService, otpService, authService, authController };
