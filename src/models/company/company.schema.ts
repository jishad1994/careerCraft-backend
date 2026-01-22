import mongoose, { Schema } from "mongoose";
import { ICompany } from "./company.interface";
import { addressSchema, documentSchema, profilePictureSchema } from "../user/user.schema";
import { IBannerImage } from "../user/user.interface";

export const bannerImageSchema = new Schema<IBannerImage>(
    {
        key: { type: String, required: true },
        location: { type: String, required: true },
    },
    { _id: false }
);

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
            index: true,
        },
        googleId: { type: String, unique: true, sparse: true, index: true },
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
        profilePicture: profilePictureSchema,
        bannerImage: bannerImageSchema,
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
        documents: [documentSchema],
        jobsPosted: [{ type: mongoose.Types.ObjectId, ref: "Job" }],
    },

    { timestamps: true }
);
