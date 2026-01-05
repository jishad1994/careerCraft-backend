import mongoose, { Model, Schema } from "mongoose";
import { IJobApplication } from "./job-application.interface";

export const jobApplicationSchema = new Schema<IJobApplication>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["applied", "pending", "processing", "rejected", "shortListed", "interviewScheduled"],
            default: "applied",
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

jobApplicationSchema.index({
    status: "text",
});

export const JobApplication: Model<IJobApplication> = mongoose.model<IJobApplication>(
    "JobApplicaion",
    jobApplicationSchema
);


