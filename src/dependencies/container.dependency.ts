import { CacheService } from "../services/cache/cache.service";
import { EmailService } from "../services/email_service/email.service";
import { RedisCacheRepo } from "../repositories/redis.repository";
import { OTPService } from "../services/otp_service/otp.service";
import { UserRepository } from "../repositories/user/user.repository";
import { AuthService } from "../services/auth/auth.service";
import { AuthController } from "../controllers/implementations/auth.controller";
import { User } from "../models/user/user.model";
import { RefreshTokenRepository } from "../repositories/refreshToken/refreshToken.repository";
import { CompanyRepository } from "../repositories/company/company.repository";
import { Company } from "../models/company/company.model";
//redis cache service instance
const redisRepo = new RedisCacheRepo(process.env.REDIS_URL || "redis://localhost:6379");
//cahce service
const cacheService = new CacheService(redisRepo);

//node mailer service
const emailService = new EmailService(
    "gmail",
    process.env.HOST_EMAIL || "jishadkolapurath@gmail.com",
    process.env.EMAIL_PASS || "rcpd qabt rtbs xqtv"
);
//OTP service
const otpService = new OTPService(cacheService, emailService);

//user Repo
const userRepo = new UserRepository(User);

//company repo
const companyRepo = new CompanyRepository(Company);

//refresh token repo

const refreshTokenRepo = new RefreshTokenRepository(cacheService);

//user auth service
const authService = new AuthService(userRepo, companyRepo, refreshTokenRepo, cacheService, otpService, emailService);

//copmany auth service

//userAuth controller
const authController = new AuthController(authService, otpService, cacheService);

//company authcontroller

export { cacheService, emailService, otpService, authService, authController };
