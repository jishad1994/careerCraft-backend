import mongoose, { Schema } from "mongoose";
import { ICompany } from "./company.interface";
import { addressSchema } from "../user/user.schema";

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
        googleId: { type: String, unique: true, sparse: true },
        phone: {
            type: String,
            unique: true,
            sparse: true,
            required: function () {
                return !this.googleId;
            },
        },
        password: {
            type: String,
            required: function () {
                return !this.googleId;
            },
        },
        profilePicture: String,
        provider: {
            type: String,
            enum: ["google", "local"],
            default: "local",
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
        address: [addressSchema],
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
            default: "pending",
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
