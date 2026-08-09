
import mongoose, { Model, Schema } from "mongoose";
import { IOfferLetter } from "./offerLetter.interface";


const compensationSchema = new Schema(
    {
        baseSalary: { type: Number, required: true },
        currency: { type: String, default: "INR" },
        period: {
            type: String,
            enum: ["monthly", "yearly"],
            default: "yearly",
        },
        bonus: String,
        otherBenefits: String,
    },
    { _id: false },
);

const signedDocumentSchema = new Schema(
    {
        fileKey: { type: String, required: true },
        fileName: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        signedURL: String,
    },
    { _id: false },
);

const offerLetterSchema = new Schema<IOfferLetter>(
    {
        application: {
            type: Schema.Types.ObjectId,
            ref: "JobApplication",
            required: true,
            index: true,
        },
        job: {
            type: Schema.Types.ObjectId,
            ref: "Job",
            required: true,
            index: true,
        },
        company: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },
        candidate: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Offer details
        offerDate: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
        designation: { type: String, required: true },
        department: { type: String, required: true },
        joiningDate: { type: Date, required: true },
        workLocation: { type: String, required: true },
        workMode: {
            type: String,
            enum: ["onsite", "remote", "hybrid"],
            required: true,
        },
        employmentType: {
            type: String,
            enum: ["full-time", "part-time", "contract", "internship"],
            required: true,
        },

        // Compensation
        compensation: {
            type: compensationSchema,
            required: true,
        },

        // Probation
        probationPeriod: Number,

        // Additional terms
        additionalTerms: String,

        // Status
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "verified"],
            default: "pending",
            index: true,
        },

        // Candidate response
        respondedAt: Date,
        rejectionReason: String,

        // Signed document
        signedDocument: signedDocumentSchema,

        // Verification
        verifiedAt: Date,
        verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },

        // Generated PDF
        generatedPdfKey: String,
        generatedPdfSignedURL: String,
    },
    { timestamps: true },
);

// Compound index: one active offer per application
// offerLetterSchema.index(
//     { application: 1, status: { $in: ["pending", "accepted"] } },
//     { unique: false },
// );

export const OfferLetterModel: Model<IOfferLetter> = mongoose.model<IOfferLetter>(
    "OfferLetter",
    offerLetterSchema,
);