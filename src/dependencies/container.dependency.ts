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
import { UserJobApplicationController } from "../controllers/user/implementations/user-job-application.controller";
import { UserJobApplicationService } from "../services/application/implementations/user-job-application.service";
import { CompanyJobApplicationController } from "../controllers/company/implementations/company-job-application.controller";
import { CompanyJobApplicationService } from "../services/application/implementations/company-job-application.service";
import { SubscriptionPlanController } from "../controllers/admin/implementations/subscription-plan.controller";
import { SubscriptionPlanService } from "../services/subscription-plan/implementation/subscription-plan.service";
import { SubscriptionPlanRepository } from "../repositories/subscription-plan/subscription-plan.repository";
import { SubscriptionPlan } from "../models/subscription-plan/subscription.schema";
import { Notification } from "../../src/models/notifications/notification.model";
import { NotificationRepository } from "../repositories/notification/notification.repository";
import { NotificationService } from "../services/notification/implementation/notification.service";
import { UserSocketMapservice } from "../shared/services/socket/implementation/socket-map.service";
import { SocketEventHandlerService } from "../shared/services/socket/implementation/socket-eventHandler.service";
import { UserNotificationController } from "../controllers/notifications/implementations/user.notification.controller";
import { SocketServer } from "../shared/services/socket/implementation/socket.server";
import { CompanySubscription } from "../models/company-subscription/company-subscription.schema";
import { CompanySubscriptionRepository } from "../repositories/company-subscription/company-subscription.repository";

import { CompanySubscriptionController } from "../controllers/company/implementations/company-subscription.controller";
import { CompanySubscriptionService } from "../services/subscription/implementations/company-subsctiption.service";
import { SubscriptionPaymentService } from "../services/subscription-payment-service/subscription-payment.service";
import { PaymentService } from "../shared/services/payment-service/payment.service";
import { StripeService } from "../shared/services/payment-providers/stripe.service";
import { PaymentRepository } from "../repositories/payment/payment.repository";
import { Payment } from "../models/payments/payments.schema";
import { CompanySubscriptionPaymentController } from "../controllers/subscription-payment/implementations/company-subscription-payment-controller";
import { CompanyCandidateController } from "../controllers/company/implementations/company.candidates.controller";

//redis cache service instance
const redisRepo = new RedisCacheRepo(process.env.REDIS_URL || "redis://localhost:6379");
//cahce service
const cacheService = new CacheService(redisRepo);

//node mailer service
const emailService = new EmailService(
    "gmail",
    process.env.HOST_EMAIL || "jishadkolapurath@gmail.com",
    process.env.EMAIL_PASS || "rcpd qabt rtbs xqtv",
);
//OTP service
const otpService = new OTPService(cacheService, emailService);

//user Repo
export const userRepo = new UserRepository(User);

//company repo
const companyRepo = new CompanyRepository(Company);

//refresh token repo

const refreshTokenRepo = new RefreshTokenRepository(cacheService);

//user auth service
const authService = new AuthService(userRepo, companyRepo, refreshTokenRepo, cacheService, otpService, emailService);

//copmany auth service

//userAuth controller
const authController = new AuthController(authService, cacheService);

//notification
const notificationRepository = new NotificationRepository(Notification);
const notificationService = new NotificationService(notificationRepository);
const notificationController = new UserNotificationController(notificationService);

//socket server
const userSocketMapService = new UserSocketMapservice(); //userId to set of socketIds
const eventHandlerService = new SocketEventHandlerService(notificationRepository, userSocketMapService);
const socketServer = new SocketServer(eventHandlerService, userSocketMapService, notificationRepository);

//file service

const s3Service = new S3Service();

const fileService = new FileService(s3Service);
//admin controller
const adminService = new AdminService(userRepo, companyRepo, emailService, fileService, cacheService);

const adminController = new AdminController(adminService);

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

// user application services
const userJobApplicationService = new UserJobApplicationService(jobApplicationRepository, fileService);
const userJobApplicationController = new UserJobApplicationController(userJobApplicationService);

//compnay application services
const companyJobApplicationService = new CompanyJobApplicationService(
    jobApplicationRepository,
    fileService,
    notificationService,
    socketServer,
);
const companyJobApplicationController = new CompanyJobApplicationController(companyJobApplicationService);

//jobs services
const userJobService = new UserJobService(jobRepository, jobApplicationRepository, fileService);
const companyJobService = new CompanyJobService(jobRepository);
const adminJobService = new AdminJobService(jobRepository, jobApplicationRepository);
const publicJobService = new PublicJobService(jobRepository);

//jobs controllers
const userJobController = new UserJobController(userJobService);
const adminJobController = new AdminJobController(adminJobService);
const companyJobController = new CompanyJobController(companyJobService, skillService);
const publicJobController = new PublicJobController(publicJobService);

//subscription
const subscriptionPlanRepository = new SubscriptionPlanRepository(SubscriptionPlan);
const subscriptionPlanService = new SubscriptionPlanService(subscriptionPlanRepository);
const subscriptionPlanController = new SubscriptionPlanController(subscriptionPlanService);

//comapany subscription

const companySubscriptionRepository = new CompanySubscriptionRepository(CompanySubscription);
const companySubscriptionService = new CompanySubscriptionService(companySubscriptionRepository);
const companySubscriptionController = new CompanySubscriptionController(
    companySubscriptionService,
    subscriptionPlanService,
);

// stripe instance

const stripe = new StripeService(process.env.STRIPE_SECRET_KEY || "");

//payment service
const paymentService = new PaymentService(stripe);
const paymentRepository = new PaymentRepository(Payment);

//company subscription payment

const companySubscriptionPaymentService = new SubscriptionPaymentService(
    paymentService,
    subscriptionPlanRepository,
    companySubscriptionRepository,
    paymentRepository,
);

const companySubscriptionPaymentController = new CompanySubscriptionPaymentController(companySubscriptionPaymentService);

const companyCandidateController = new CompanyCandidateController(userProfileService);

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
    userJobApplicationController,
    companyJobApplicationController,
    subscriptionPlanController,
    notificationRepository,
    notificationService,
    userSocketMapService,
    eventHandlerService,
    notificationController,
    socketServer,
    companySubscriptionController,
    companySubscriptionPaymentController,
    companyCandidateController,
};
