import { CacheService } from "../services/cache/cache.service";
import { EmailService } from "../services/email_service/email.service";
import { RedisCacheRepo } from "../repositories/redis.repository";
import { OTPService } from "../services/otp_service/OTP.service";
import { UserRepository } from "../repositories/user/user.repository";
import { AuthService } from "../services/auth/auth.service";
import { AuthController } from "../controllers/auth/auth.controller";
import { User } from "../models/user/user.model";
import { RefreshTokenRepository } from "../repositories/refreshToken/refreshToken.repository";
import { CompanyRepository } from "../repositories/company/company.repository";
import { Company } from "../models/company/company.model";
import { AdminController } from "../controllers/admin/implementations/admin.controller";
import { AdminService } from "../services/admin/admin.service";
import { UserProfileController } from "../controllers/user/implementations/profile.controller";
import { UserProfileService } from "../services/user/implementations/profile.service";
import { CompanyProfileController } from "../controllers/company/implementations/company-profile.controller";
import { CompanyProfileService } from "../services/company/implementations/profile.service";
import { SkillRepository } from "../repositories/skill/skill.repository";
import { Skill } from "../models/skill/skill.model";
import { SkillController } from "../controllers/skill/implementation/skill.controller";
import { SkillsService } from "../services/skills/implementations/skills.services";
import { FileService } from "../services/file-service/implementations/file.service";
import { S3Service } from "../shared/services/s3.service";
import { JobRepository } from "../repositories/job/job.repository";
import { Job } from "../models/job/job.schema";
import { UserJobService } from "../services/job/implementations/user-job.service";
import { CompanyJobService } from "../services/job/implementations/company-job.service";
import { JobApplicationRepository } from "../repositories/application/job-application.repository";
import { JobApplication } from "../models/job-application/job-application.schema";
import { AdminJobService } from "../services/job/implementations/admin-job.service";
import { PublicJobService } from "../services/job/implementations/public-Job.service";
import { UserJobController } from "../controllers/user/implementations/user-job.controller";
import { AdminJobController } from "../controllers/admin/implementations/admin-job.controller";
import { CompanyJobController } from "../controllers/company/implementations/company-jobs.controller";
import { PublicJobController } from "../controllers/job/implementations/public-job.controller";

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
const authController = new AuthController(authService, cacheService);

//company authcontroller

//admin controller
const adminService = new AdminService(userRepo, companyRepo);

const adminController = new AdminController(adminService);

//file service

const s3Service = new S3Service();

const fileService = new FileService(s3Service);

// user profile controller
const userProfileService = new UserProfileService(userRepo, fileService);

const companyProfileService = new CompanyProfileService(companyRepo, fileService);

const userProfileController = new UserProfileController(userProfileService);

const companyProfileController = new CompanyProfileController(companyProfileService);

//skill controller

const skillRepository = new SkillRepository(Skill);

const skillService = new SkillsService(skillRepository);

const skillController = new SkillController(skillService);

// jobs controller

const jobRepository = new JobRepository(Job);
const jobApplicationRepository = new JobApplicationRepository(JobApplication);

const userJobService = new UserJobService(jobRepository, jobApplicationRepository);
const companyJobService = new CompanyJobService(jobRepository);
const adminJobService = new AdminJobService(jobRepository);
const publicJobService = new PublicJobService(jobRepository);

const userJobController = new UserJobController(userJobService);
const adminJobController = new AdminJobController(adminJobService);
const companyJobController = new CompanyJobController(companyJobService);
const publicJobController = new PublicJobController(publicJobService);

export {
    cacheService,
    emailService,
    otpService,
    authService,
    authController,
    adminController,
    userProfileController,
    companyProfileController,
    skillController,
    userJobController,
    adminJobController,
    companyJobController,
    publicJobController,
};
