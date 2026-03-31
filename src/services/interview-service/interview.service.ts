import { AppError } from "../../errors-classes/app.error.";
import { InterviewFilter, InterviewWithPopulated } from "../../interfaces/interview.interface";
import { IInterview, IJobApplicationDetails } from "../../models/job-application/job-application.interface";
import { NOTIFICATION_TYPES } from "../../models/notifications/notification.interface";
import { IJobApplicationRepository } from "../../repositories/application/job-application.repository.interface";
import { ISocketService } from "../../shared/services/socket/interface/socket.service.interface";
import { PaginationMeta } from "../../utils/apiResponse.utils";
import { INotificationService } from "../notification/interface/notification.service.interface";
import { IInterviewService } from "./interivew.service.interface";

export class InterviewService implements IInterviewService {
    constructor(
        private readonly applicationRepository: IJobApplicationRepository,
        private readonly notificationService: INotificationService,
        private readonly socketService: ISocketService,
    ) {}

    async getPopulatedInterviewById(interviewId: string): Promise<InterviewWithPopulated> {
        const interview = await this.applicationRepository.findPopulatedInterviewById(interviewId);

        if (!interview) {
            throw new Error("Interview not found");
        }

        return interview;
    }

    async scheduleInterview(
        applicationId: string,
        interviewData: Partial<IInterview>,
        // scheduledBy: string
    ): Promise<IInterview> {
        const application = await this.applicationRepository.findApplicationDetailsById(applicationId);
        if (!application) {
            throw new Error("Application not found");
        }

        this.validateInterviewData(interviewData);

        const interview: IInterview = {
            round: interviewData.round || 1,
            type: interviewData.type!,
            scheduledAt: new Date(interviewData.scheduledAt!),
            status: "scheduled",
        };

        await this.applicationRepository.addInterview(applicationId, interview);

        // Create notification
        await this.createInterviewNotification(application.applicant._id.toString(), application, interview, "scheduled");

        // Send socket notification
        await this.socketService.sendNotificationToUser(application.applicant._id.toString(), {
            type: "INTERVIEW_SCHEDULED",
            title: "Interview Scheduled",
            message: `Your ${interview.type} interview (Round ${interview.round}) for ${application.jobDetails.title} has been scheduled`,
            priority: "high",
            link: `/applications/${application._id}`,
        });

        // Schedule reminder (15 min before)
        // await this.scheduleInterviewReminder(application.applicant._id.toString(), application, interview);

        return interview;
    }

    async rescheduleInterview(
        applicationId: string,
        interviewId: string,
        round: number,
        newScheduledAt: Date,
        reason?: string,
    ): Promise<IInterview> {
        const application = await this.applicationRepository.findApplicationDetailsById(applicationId);
        if (!application) {
            throw new Error("Application not found");
        }

        const interview = application.interviews?.find((i) => String(i._id) === interviewId);

        if (!interview) {
            throw new Error("Interview not found");
        }

        const updatedInterview: Partial<IInterview> = {
            scheduledAt: newScheduledAt,
            status: "rescheduled",
            isRescheduled: true,
            rescheduledReson: reason,
        };

        await this.applicationRepository.updateInterview(applicationId, interviewId, updatedInterview);

        await this.createInterviewNotification(
            application.applicant._id.toString(),
            application,
            { ...interview, ...updatedInterview },
            "rescheduled",
            reason,
        );

        await this.socketService.sendNotificationToUser(application.applicant._id.toString(), {
            type: "INTERVIEW_RESCHEDULED",
            title: "Interview Rescheduled",
            message: `Your interview (Round ${round}) has been rescheduled`,
            priority: "high",
            link: `/applications/${application._id}`,
        });

        return { ...interview, ...updatedInterview };
    }

    async cancelInterview(applicationId: string, interviewId: string, round: number, reason?: string): Promise<IInterview> {
        const application = await this.applicationRepository.findApplicationDetailsById(applicationId);
        if (!application) {
            throw new Error("Application not found");
        }

        const interview = application.interviews?.find((i) => i.round === round);
        if (!interview) {
            throw new Error("Interview not found");
        }

        const updatedInterview: Partial<IInterview> = {
            status: "cancelled",
        };

        await this.applicationRepository.updateInterview(applicationId, interviewId, updatedInterview);

        await this.createInterviewNotification(
            application.applicant._id.toString(),
            application,
            { ...interview, ...updatedInterview },
            "cancelled",
            reason,
        );

        await this.socketService.sendNotificationToUser(application.applicant._id.toString(), {
            type: "INTERVIEW_CANCELLED",
            title: "Interview Cancelled",
            message: `Your interview (Round ${round}) has been cancelled`,
            priority: "high",
            link: `/applications/${application._id}`,
        });

        return { ...interview, ...updatedInterview };
    }

    async updateInterview(
        applicationId: string,
        interviewId: string,

        updateData: Partial<IInterview>,
    ): Promise<IInterview> {
        const application = await this.applicationRepository.findById(applicationId);
        if (!application) {
            throw new AppError("Application not found", 401);
        }

        const interview = application.interviews?.find((i) => i._id?.toString() === interviewId);
        if (!interview) {
            throw new Error("Interview not found");
        }

        await this.applicationRepository.updateInterview(applicationId, interviewId, updateData);

        return { ...interview, ...updateData };
    }

    async completeInterview(
        applicationId: string,
        interviewId: string,
        round: number,
        feedback?: string,
        rating?: number,
    ): Promise<IInterview> {
        const updateData: Partial<IInterview> = {
            status: "completed",
            completedAt: new Date(),
            feedback,
            rating,
        };

        return await this.updateInterview(applicationId, interviewId, updateData);
    }

    async getInterviews(
        filter: InterviewFilter,
        page: number = 1,
        limit: number = 10,
    ): Promise<{ interviews: InterviewWithPopulated[]; paginationMeta: PaginationMeta }> {
        const [interviews, total] = await this.applicationRepository.getInterviewsWithPopulated(filter, page, limit);

        const totalPages = Math.ceil(total / limit);

        const paginationMeta: PaginationMeta = {
            page,
            limit,
            totalItems: total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };

        return { interviews, paginationMeta };
    }

    /**
     * Get upcoming interviews
     */
    async getUpcomingInterviews(
        filter: Partial<InterviewFilter>,
        days: number = 7,
        page: number = 1,
        limit: number = 10,
    ): Promise<{ interviews: InterviewWithPopulated[]; paginationMeta: PaginationMeta }> {
        const [interviews, total] = await this.applicationRepository.getUpcomingInterviews(filter, days, page, limit);

        const totalPages = Math.ceil(total / limit);

        const paginationMeta: PaginationMeta = {
            page,
            limit,
            totalItems: total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };

        return { interviews, paginationMeta };
    }

    /**
     * Get interview statistics
     */
    async getInterviewStats(filter: Partial<InterviewFilter>): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
        upcoming: number;
        past: number;
    }> {
        return await this.applicationRepository.getInterviewStats(filter);
    }

    private validateInterviewData(data: Partial<IInterview>): void {
        if (!data.type) {
            throw new Error("Interview type is required");
        }

        if (!data.scheduledAt) {
            throw new Error("Scheduled date/time is required");
        }

        const scheduledDate = new Date(data.scheduledAt);
        if (scheduledDate < new Date()) {
            throw new Error("Interview cannot be scheduled in the past");
        }

        const validTypes = ["phone", "video", "in-person", "technical", "hr"];
        if (!validTypes.includes(data.type)) {
            throw new Error("Invalid interview type");
        }
    }

    private async createInterviewNotification(
        userId: string,
        application: IJobApplicationDetails,
        interview: IInterview,
        action: "scheduled" | "rescheduled" | "cancelled",
        reason?: string,
    ): Promise<void> {
        let title = "";
        let message = "";

        switch (action) {
            case "scheduled":
                title = "Interview Scheduled";
                message = `Your ${interview.type} interview (Round ${interview.round}) for ${application.jobDetails.title} has been scheduled for ${new Date(interview.scheduledAt!).toLocaleString()}`;
                break;

            case "rescheduled":
                title = "Interview Rescheduled";
                message = `Your ${interview.type} interview (Round ${interview.round}) has been rescheduled to ${new Date(interview.scheduledAt!).toLocaleString()}`;
                if (reason) message += `. Reason: ${reason}`;
                break;

            case "cancelled":
                title = "Interview Cancelled";
                message = `Your ${interview.type} interview (Round ${interview.round}) has been cancelled`;
                if (reason) message += `. Reason: ${reason}`;
                break;
        }

        await this.notificationService.createNotification({
            userId,
            type: NOTIFICATION_TYPES.INTERVIEW_SCHEDULED,
            title,
            message,
            priority: "high",
            link: `/applications/${application._id}`,
        });
    }

    // private async scheduleInterviewReminder(userId: string, application: any, interview: IInterview): Promise<void> {
    //     // const scheduledTime = new Date(interview.scheduledAt!);
    //     // const reminderTime = new Date(scheduledTime.getTime() - 15 * 60 * 1000);
    //     // if (reminderTime > new Date()) {
    //     //     await this.notificationService.scheduleNotification({
    //     //         userId,
    //     //         type: "INTERVIEW_REMINDER",
    //     //         title: "Interview Starting Soon",
    //     //         message: `Your ${interview.type} interview (Round ${interview.round}) starts in 15 minutes`,
    //     //         priority: "urgent",
    //     //         link:
    //     //             interview.type === "video"
    //     //                 ? `/video-interview/${application._id}/${interview.round}`
    //     //                 : `/applications/${application._id}`,
    //     //         scheduledFor: reminderTime,
    //     //     });
    //     // }
    // }
}
