import mongoose, { Document, Types } from "mongoose";

export type JobApplicationStatus = "applied" | "pending" | "processing" | "rejected" | "shortListed" | "interviewScheduled";

export interface IJobApplication extends Document<mongoose.Types.ObjectId> {
    user: Types.ObjectId | string;
    job: Types.ObjectId | string;
    company: Types.ObjectId | string;
    status: JobApplicationStatus;
}
