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
import { InterviewService } from "../services/interview-service/interview.service";
import { WebRTCEventHandler } from "../services/Webrtc/implementations/Webrtc.event-handler.service";
import { WebRTCService } from "../services/Webrtc/implementations/Webrtc.service";
import { WebRTCRepository } from "../repositories/webrtc/Webrtc.repository";
import { CallSession } from "../models/call-session/call.session.schema";
import { InvoiceService } from "../shared/services/invoice-service/invoice.service";
import { InvoiceRepository } from "../repositories/invoice/invoice.repository";
import { Invoice } from "../models/invoice/invoice.model";
import { InvoiceController } from "../controllers/invoice/invoice.controller";
import { ChatEventHandler } from "../shared/services/socket/implementation/chat-eventHandler.service";
import { ChatService } from "../services/chat/chat.service";
import { ConversationRepository } from "../repositories/chat/implementations/conversation.repository";
import { Conversation } from "../models/chat/implementations/conversation.schema";
import { MessageRepository } from "../repositories/chat/implementations/message.repository";
import { Message } from "../models/chat/implementations/message.schema";
import { ChatController } from "../controllers/chat/chat.controller";
import { SubscriptionAddonRepository } from "../repositories/subscription-addon/subscription-addon.repository";
import { SubscriptionAddon } from "../models/subscription-add-on/addon.model";
import { BullMQService } from "../shared/services/bullmq.service";
import { SubscriptionCancellationQueueService } from "../services/subscription/implementations/subscription-cancellation.service";

import { ResumeBuilderService } from "../services/user/implementations/resume.service";
import { ResumeRepository } from "../repositories/resume/resume.repository";

import { ResumeBuilderController } from "../controllers/user/implementations/user-resume-builder.controller";
import { PdfGenerationService } from "../services/user/implementations/PdfGeneration.service";
import { ResumeModel } from "../models/resume/resume.model";
import { OfferLetterRepository } from "../repositories/offer-letter/offerLetter.repository";
import { OfferLetterModel } from "../models/offer-letter/offerLetter.model";
import { OfferLetterService } from "../shared/services/offerLetter-service/offerLetter.service";
import { CandidateOfferLetterController } from "../controllers/offerLetter/implementations/candidate-offerLetter.controller";
import { CompanyOfferLetterController } from "../controllers/offerLetter/implementations/company-offerLetter.controller";

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

//file service

const s3Service = new S3Service();

const fileService = new FileService(s3Service);

//userAuth controller
const authController = new AuthController(authService, cacheService);

//notification
const notificationRepository = new NotificationRepository(Notification);
const notificationService = new NotificationService(notificationRepository);
const notificationController = new UserNotificationController(notificationService);

//vido or audio call session repository

const webRTCRepository = new WebRTCRepository(CallSession);
//webrtc service
const webrtcService = new WebRTCService(webRTCRepository);
//webrtc event handler service
const webrtcEventHandlerService = new WebRTCEventHandler(webrtcService);

//socket server
const userSocketMapService = new UserSocketMapservice(); //userId to set of socketIds
const eventHandlerService = new SocketEventHandlerService(notificationRepository, userSocketMapService);
const conversationRepository = new ConversationRepository(Conversation);
const messageRepository = new MessageRepository(Message);
const chatService = new ChatService(conversationRepository, messageRepository, fileService, notificationService);
const chatHandlerService = new ChatEventHandler(chatService, userSocketMapService);
const socketServer = new SocketServer(
    eventHandlerService,
    userSocketMapService,
    webrtcEventHandlerService,
    notificationRepository,
    chatHandlerService,
);

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

//compnay application services
const companyJobApplicationService = new CompanyJobApplicationService(
    jobApplicationRepository,
    fileService,
    notificationService,
    socketServer,
);

const interviewServie = new InterviewService(jobApplicationRepository, notificationService, socketServer);
const companyJobApplicationController = new CompanyJobApplicationController(companyJobApplicationService, interviewServie);

// user application services
const userJobApplicationService = new UserJobApplicationService(jobApplicationRepository, fileService);
const userJobApplicationController = new UserJobApplicationController(userJobApplicationService, interviewServie);

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

//addon

const addonRepository = new SubscriptionAddonRepository(SubscriptionAddon);

//subscription
const subscriptionPlanRepository = new SubscriptionPlanRepository(SubscriptionPlan);
const subscriptionPlanService = new SubscriptionPlanService(subscriptionPlanRepository);
const subscriptionPlanController = new SubscriptionPlanController(subscriptionPlanService);

//comapany subscription

const companySubscriptionRepository = new CompanySubscriptionRepository(CompanySubscription);
const companySubscriptionService = new CompanySubscriptionService(companySubscriptionRepository, addonRepository);
const comanySubscriptionCancellationService = new SubscriptionCancellationQueueService(companySubscriptionRepository);
const companySubscriptionController = new CompanySubscriptionController(
    companySubscriptionService,
    subscriptionPlanService,
    comanySubscriptionCancellationService,
);

// stripe instance

const stripe = new StripeService(process.env.STRIPE_SECRET_KEY || "");

//payment service
const paymentService = new PaymentService(stripe);
const paymentRepository = new PaymentRepository(Payment);

//company subscription payment

//invoice
const invoiceRepository = new InvoiceRepository(Invoice);
const invoiceService = new InvoiceService(
    invoiceRepository,
    companyRepo,
    companySubscriptionRepository,
    paymentRepository,
    fileService,
);
const invoiceController = new InvoiceController(invoiceService);

//subscription payment controller
const companySubscriptionPaymentService = new SubscriptionPaymentService(
    paymentService,
    subscriptionPlanRepository,
    companySubscriptionRepository,
    paymentRepository,
    invoiceService,
    addonRepository,
);

const companySubscriptionPaymentController = new CompanySubscriptionPaymentController(companySubscriptionPaymentService);

const companyCandidateController = new CompanyCandidateController(userProfileService);

//chat

const chatController = new ChatController(chatService);

//bullmq service
const bullMQService = new BullMQService(
    companySubscriptionPaymentService,
    companySubscriptionService,
    process.env.redisUrl || "redis://localhost:6379",
);
const resumeRepository = new ResumeRepository(ResumeModel);
const resumePdfService = new PdfGenerationService();
const resumebuilderService = new ResumeBuilderService(userRepo, resumeRepository, resumePdfService, fileService);
const resumeBuilderController = new ResumeBuilderController(resumebuilderService);

//offer letter

const offerLetterRepository = new OfferLetterRepository(OfferLetterModel);
const offerLetterService = new OfferLetterService(
    offerLetterRepository,
    jobApplicationRepository,
    resumePdfService,
    fileService,
);

const candidateOfferLetterController = new CandidateOfferLetterController(offerLetterService);

const companyOfferLetterController = new CompanyOfferLetterController(offerLetterService);
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
    invoiceController,
    chatController,
    bullMQService,
    resumeBuilderController,
    candidateOfferLetterController,
    companyOfferLetterController,
};
