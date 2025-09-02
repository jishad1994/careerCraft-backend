import mongoose, { Schema } from "mongoose";
import { ICompany } from "./company.interface";

export const companySchema = new Schema<ICompany>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["company", "user", "admin"],
            default: "company",
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },

        website: String,
        location: String,
        industry: String,
        GSTIN: String,
        address: [String],
        logo: String,
        bannerImage: String,
        description: String,
        subscriptionPackage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Package",
        },
        subscriptionStatus: {
            type: String,
            enum: ["active", "expired", "pending"],
            defaut: "pending",
        },
        subscriptionStart: Date,
        subscriptionEnd: Date,
        numberOfEmployees: Number,
        staffs: [{ type: mongoose.Types.ObjectId, ref: "Staff" }],
        documents: [String],
        jobsPosted: [{ type: mongoose.Types.ObjectId, ref: "Job" }],
    },
    { timestamps: true }
);
