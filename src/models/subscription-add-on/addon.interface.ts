import mongoose, { Document } from "mongoose";

export interface ISubscriptionAddon extends Document<mongoose.Types.ObjectId> {
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    type: "jobs" | "resumeViews" | "featuredJobs";
    quantity: number;
    price: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
