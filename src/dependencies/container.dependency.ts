import { CacheService } from "../services/cache/cache.service.js";
import { EmailService } from "../services/email_service/email.service.js";
import { RedisCacheRepo } from "../repositories/redis.repository.js";
import { OTPService } from "../services/otp_service/OTP.service.js";
import { UserRepository } from "../repositories/user/user.repository.js";
import { AuthService } from "../services/auth/auth.service.js";
import { AuthController } from "../controllers/auth/auth.controller.js";
import { User } from "../models/user/user.model.js";
import { RefreshTokenRepository } from "../repositories/refreshToken/refreshToken.repository.js";
import { CompanyRepository } from "../repositories/company/company.repository.js";
import { Company } from "../models/company/company.model.js";
import { AdminController } from "../controllers/admin/implementations/admin.controller.js";
import { AdminService } from "../services/admin/admin.service.js";
import { UserProfileController } from "../controllers/user/implementations/profile.controller.js";
import { UserProfileService } from "../services/user/implementations/profile.service.js";
import { CompanyProfileController } from "../controllers/company/implementations/company-profile.controller.js";
import { CompanyProfileService } from "../services/company/implementations/profile.service.js";
import { SkillRepository } from "../repositories/skill/skill.repository.js";
import { Skill } from "../models/skill/skill.model.js";
import { SkillController } from "../controllers/skill/implementation/skill.controller.js";
import { SkillsService } from "../services/skills/implementations/skills.services.js";
import { FileService } from "../services/file-service/implementations/file.service.js";
import { S3Service } from "../shared/services/s3.service.js";
import { JobRepository } from "../repositories/job/job.repository.js";
import { Job } from "../models/job/job.schema.js";
import { UserJobService } from "../services/job/implementations/user-job.service.js";
import { CompanyJobService } from "../services/job/implementations/company-job.service.js";
import { JobApplicationRepository } from "../repositories/application/job-application.repository.js";
import { JobApplication } from "../models/job-application/job-application.schema.js";
import { AdminJobService } from "../services/job/implementations/admin-job.service.js";
import { PublicJobService } from "../services/job/implementations/public-Job.service.js";
import { UserJobController } from "../controllers/user/implementations/user-job.controller.js";
import { AdminJobController } from "../controllers/admin/implementations/admin-job.controller.js";
import { CompanyJobController } from "../controllers/company/implementations/company-jobs.controller.js";
import { PublicJobController } from "../controllers/job/implementations/public-job.controller.js";
import { UserJobApplicationController } from "../controllers/user/implementations/user-job-application.controller.js";
import { UserJobApplicationService } from "../services/application/implementations/user-job-application.service.js";
import { CompanyJobApplicationController } from "../controllers/company/implementations/company-job-application.controller.js";
import { CompanyJobApplicationService } from "../services/application/implementations/company-job-application.service.js";
import { SubscriptionPlanController } from "../controllers/admin/implementations/subscription-plan.controller.js";
import { SubscriptionPlanService } from "../services/subscription-plan/implementation/subscription-plan.service.js";
import { SubscriptionPlanRepository } from "../repositories/subscription-plan/subscription-plan.repository.js";
import { SubscriptionPlan } from "../models/subscription-plan/subscription.schema.js";
import { Notification } from "../models/notifications/notification.model.js";
import { NotificationRepository } from "../repositories/notification/notification.repository.js";
import { NotificationService } from "../services/notification/implementation/notification.service.js";
import { UserSocketMapservice } from "../shared/services/socket/implementation/socket-map.service.js";
import { SocketEventHandlerService } from "../shared/services/socket/implementation/socket-eventHandler.service.js";
import { UserNotificationController } from "../controllers/notifications/implementations/user.notification.controller.js";
import { SocketServer } from "../shared/services/socket/implementation/socket.server.js";
import { CompanySubscription } from "../models/company-subscription/company-subscription.schema.js";
import { CompanySubscriptionRepository } from "../repositories/company-subscription/company-subscription.repository.js";

import { CompanySubscriptionController } from "../controllers/company/implementations/company-subscription.controller.js";
import { CompanySubscriptionService } from "../services/subscription/implementations/company-subsctiption.service.js";
import { SubscriptionPaymentService } from "../services/subscription-payment-service/subscription-payment.service.js";
import { PaymentService } from "../shared/services/payment-service/payment.service.js";
import { StripeService } from "../shared/services/payment-providers/stripe.service.js";
import { PaymentRepository } from "../repositories/payment/payment.repository.js";
import { Payment } from "../models/payments/payments.schema.js";
import { CompanySubscriptionPaymentController } from "../controllers/subscription-payment/implementations/company-subscription-payment-controller.js";
import { CompanyCandidateController } from "../controllers/company/implementations/company.candidates.controller.js";
import { InterviewService } from "../services/interview-service/interview.service.js";
import { WebRTCEventHandler } from "../services/Webrtc/implementations/Webrtc.event-handler.service.js";
import { WebRTCService } from "../services/Webrtc/implementations/Webrtc.service.js";
import { WebRTCRepository } from "../repositories/webrtc/Webrtc.repository.js";
import { CallSession } from "../models/call-session/call.session.schema.js";
import { InvoiceService } from "../shared/services/invoice-service/invoice.service.js";
import { InvoiceRepository } from "../repositories/invoice/invoice.repository.js";
import { Invoice } from "../models/invoice/invoice.model.js";
import { InvoiceController } from "../controllers/invoice/invoice.controller.js";
import { ChatEventHandler } from "../shared/services/socket/implementation/chat-eventHandler.service.js";
import { ChatService } from "../services/chat/chat.service.js";
import { ConversationRepository } from "../repositories/chat/implementations/conversation.repository.js";
import { Conversation } from "../models/chat/implementations/conversation.schema.js";
import { MessageRepository } from "../repositories/chat/implementations/message.repository.js";
import { Message } from "../models/chat/implementations/message.schema.js";
import { ChatController } from "../controllers/chat/chat.controller.js";
import { SubscriptionAddonRepository } from "../repositories/subscription-addon/subscription-addon.repository.js";
import { SubscriptionAddon } from "../models/subscription-add-on/addon.model.js";
import { BullMQService } from "../shared/services/bullmq.service.js";
import { SubscriptionCancellationQueueService } from "../services/subscription/implementations/subscription-cancellation.service.js";

import { ResumeBuilderService } from "../services/user/implementations/resume.service.js";
import { ResumeRepository } from "../repositories/resume/resume.repository.js";

import { ResumeBuilderController } from "../controllers/user/implementations/user-resume-builder.controller.js";
import { PdfGenerationService } from "../services/user/implementations/PdfGeneration.service.js";
import { ResumeModel } from "../models/resume/resume.model.js";
import { OfferLetterRepository } from "../repositories/offer-letter/offerLetter.repository.js";
import { OfferLetterModel } from "../models/offer-letter/offerLetter.model.js";
import { OfferLetterService } from "../shared/services/offerLetter-service/offerLetter.service.js";
import { CandidateOfferLetterController } from "../controllers/offerLetter/implementations/candidate-offerLetter.controller.js";
import { CompanyOfferLetterController } from "../controllers/offerLetter/implementations/company-offerLetter.controller.js";

//redis cache service instance
const redisRepo = new RedisCacheRepo(process.env.REDIS_URL || "redis://6379");
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
const bullMQService = new BullMQService(companySubscriptionPaymentService, companySubscriptionService);
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
