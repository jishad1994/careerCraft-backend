import mongoose, { Document } from "mongoose";

export const JOB_APPLICATION_STATUSES = {
    PENDING: "pending",
    REVIEWING: "reviewing",
    SHORTLISTED: "shortlisted",
    INTERVIEWED: "interviewed",
    OFFERED: "offered",
    REJECTED: "rejected",
    WITHDRAWN: "withdrawn",
    HIRED: "hired",
} as const;

export type JobApplicationStatus = (typeof JOB_APPLICATION_STATUSES)[keyof typeof JOB_APPLICATION_STATUSES];

export interface JobApplicationStatistics {
    total: number;
    pending: number;
    reviewing: number;
    shortlisted: number;
    interviewed: number;
    offered: number;
    rejected: number;
    hired: number;
    withdrawn: number;
}

export interface IJobApplication extends Document<mongoose.Types.ObjectId> {
    job: mongoose.Types.ObjectId;
    applicant: mongoose.Types.ObjectId;
    company: mongoose.Types.ObjectId;

    resume: {
        fileName: string;
        fileKey: string;
        signedURL?: string;
        uploadedAt?: Date;
    };

    coverLetter: {
        type: "text" | "document";
        content?: string;
        fileName?: string;
        fileUrl?: string;
        fileKey?: string;
        uploadedAt?: Date;
    };

    expectedSalary?: {
        amount: number;
        currency: string;
        period: "monthly" | "yearly";
    };

    availableFrom?: Date;
    noticePeriod?: number;

    portfolioUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    otherLinks?: string[];

    screeningAnswers?: Array<{
        question: string;
        answer: string;
    }>;

    status: "pending" | "reviewing" | "shortlisted" | "interviewed" | "offered" | "rejected" | "withdrawn" | "hired";

    statusHistory: Array<{
        status: string;
        changedAt: Date;
        changedBy?: mongoose.Types.ObjectId;
        notes?: string;
    }>;

    notes?: string;
    feedback?: string;

    interviews?: Array<{
        round: number;
        type: "phone" | "video" | "in-person" | "technical" | "hr";
        scheduledAt?: Date;
        completedAt?: Date;
        interviewers?: mongoose.Types.ObjectId[];
        feedback?: string;
        rating?: number; // 1-5
        status: "scheduled" | "completed" | "cancelled" | "rescheduled";
    }>;

    appliedAt: Date;
    viewedAt?: Date;
    viewedBy?: mongoose.Types.ObjectId;
    lastUpdatedAt: Date;

    source?: "direct" | "referral" | "job-board" | "social-media" | "other";
    referredBy?: mongoose.Types.ObjectId;

    isStarred: boolean;
    isArchived: boolean;

    createdAt: Date;
    updatedAt: Date;
}
