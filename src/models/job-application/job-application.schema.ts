import mongoose, { Model, Schema } from "mongoose";
import { IJobApplication } from "./job-application.interface";

const jobApplicationSchema = new Schema<IJobApplication>(
    {
        job: {
            type: Schema.Types.ObjectId,
            ref: "Job",
            required: true,
            index: true,
        },

        applicant: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        company: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        resume: {
            fileName: String,
            fileKey: String,
            signedURL: String,
            // mimeType: String,
            // size: Number,
            uploadedAt: {
                type: Date,
                default: Date.now(),
            },
        },

        coverLetter: {
            type: {
                type: String,
                enum: ["text", "document"],
            },
            content: String,
            fileName: String,
            fileUrl: String,
            fileKey: String,
            uploadedAt: Date,
        },

        expectedSalary: {
            amount: Number,
            currency: {
                type: String,
                default: "INR",
            },
            period: {
                type: String,
                enum: ["monthly", "yearly"],
                default: "monthly",
            },
        },

        availableFrom: Date,
        noticePeriod: Number,

        portfolioUrl: String,
        linkedinUrl: String,
        githubUrl: String,
        otherLinks: [String],

        screeningAnswers: [
            {
                question: { type: String, required: true },
                answer: { type: String, required: true },
            },
        ],

        status: {
            type: String,
            enum: ["pending", "reviewing", "shortlisted", "interviewed", "offered", "rejected", "withdrawn", "hired"],
            default: "pending",
            index: true,
        },

        statusHistory: [
            {
                status: { type: String, required: true },
                changedAt: { type: Date, default: Date.now },
                changedBy: { type: Schema.Types.ObjectId, ref: "User" },
                notes: String,
            },
        ],

        notes: String,
        feedback: String,

        interviews: [
            {
                round: { type: Number, required: true },
                type: {
                    type: String,
                    enum: ["phone", "video", "in-person", "technical", "hr"],
                    required: true,
                },
                scheduledAt: Date,
                completedAt: Date,
                // interviewers: [{ type: Schema.Types.ObjectId, ref: "User" }],
                feedback: String,
                rating: { type: Number, min: 1, max: 5 },
                status: {
                    type: String,
                    enum: ["scheduled", "completed", "cancelled", "rescheduled"],
                    default: "scheduled",
                },
            },
        ],

        // Metadata
        appliedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        viewedAt: Date,
        viewedBy: { type: Schema.Types.ObjectId, ref: "User" },
        lastUpdatedAt: {
            type: Date,
            default: Date.now,
        },

        // Source tracking
        source: {
            type: String,
            enum: ["direct", "referral", "job-board", "social-media", "other"],
            default: "direct",
        },
        referredBy: { type: Schema.Types.ObjectId, ref: "User" },

        // Flags
        isStarred: {
            type: Boolean,
            default: false,
            index: true,
        },
        isArchived: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

// Pre-save middleware to update statusHistory
jobApplicationSchema.pre("save", function (next) {
    if (this.isModified("status")) {
        this.statusHistory.push({
            status: this.status,
            changedAt: new Date(),
            changedBy: undefined,
            notes: undefined,
        });
    }
    this.lastUpdatedAt = new Date();
    next();
});

jobApplicationSchema.virtual("applicationAge").get(function () {
    return Math.floor((Date.now() - this.appliedAt.getTime()) / (1000 * 60 * 60 * 24));
});

export const JobApplication: Model<IJobApplication> = mongoose.model<IJobApplication>(
    "JobApplication",
    jobApplicationSchema
);
