import mongoose, { Schema } from "mongoose";
import { COMPANY_REJECTION_CODES, COMPANY_VERIFICATION_STATUS, ICompany, IRejectionReason } from "./company.interface";
import { addressSchema, documentSchema } from "../user/user.schema";
import { CompanyVerificationHelper } from "../../service-helpers/company-verification.helper";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";
import { bannerImageSchema, profilePictureSchema } from "../common/common.profile.schema";

export const rejectionReasonSchema = new Schema<IRejectionReason>(
    {
        code: {
            type: String,
            required: true,
            enum: Object.values(COMPANY_REJECTION_CODES),
        },
        description: String,
        rejectedAt: Date,
    },
    { _id: false },
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
            required: function (this: ICompany) {
                return !this.googleId;
            },
        },
        password: {
            type: String,
            required: function (this: ICompany) {
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
        verificationStatus: {
            type: String,
            enum: Object.values(COMPANY_VERIFICATION_STATUS),
            default: "pending",
        },
        rejectionReasons: [rejectionReasonSchema],

        website: String,
        location: String,
        industry: String,
        GSTIN: String,
        address: [addressSchema],
        logo: String,
        description: String,
        activeSubscriptionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CompanySubscription",
            default: null,
        },
        numberOfEmployees: Number,
        staffs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Staff" }],
        documents: [documentSchema],
        jobsPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    },

    { timestamps: true },
);

companySchema.plugin(mongooseLeanVirtuals);
companySchema.set("toJSON", { virtuals: true });
companySchema.set("toObject", { virtuals: true });

companySchema.virtual("profileCompletion").get(function () {
    return CompanyVerificationHelper.evaluate(this).completionPercentage;
});
