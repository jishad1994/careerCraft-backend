import { CacheService } from "../services/cache/cache.service";
import { NodeMailerService } from "../services/email_service/nodemailer.service";
import { RedisCacheRepo } from "../repositories/redis.repository";
import { OTPService } from "../services/otp_service/otp.service";
import { UserRepo } from "../repositories/user/user.repository";
import { UserAuthService } from "../services/user/user.auth.service";
import { UserAuthController } from "../controllers/user.auth.controller";
import { User } from "../models/user/user.model";
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

//user auth service
const userAuthService = new UserAuthService(userRepo);

//userAuthService
const userAuthController = new UserAuthController(userAuthService, otpService, cacheService);

export { cacheService, nodeMailerService, otpService, userAuthService ,userAuthController};
