import mongoose, { Schema, Model } from "mongoose";
import {
    IResume,
    IResumeEducation,
    IResumeExperience,
    IResumePersonalInfo,
    IResumeSkill,
    IResumeSummary,
} from "./resume.interface";

// ---- Sub-schemas ----

const resumePersonalInfoSchema = new Schema<IResumePersonalInfo>(
    {
        fullName: { type: String, default: "" },
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        location: { type: String, default: "" },
        linkedIn: { type: String, default: "" },
        portfolio: { type: String, default: "" },
    },
    { _id: false },
);

const resumeSummarySchema = new Schema<IResumeSummary>(
    {
        text: { type: String, default: "" },
    },
    { _id: false },
);

const resumeExperienceSchema = new Schema<IResumeExperience>(
    {
        jobTitle: { type: String, default: "" },
        company: { type: String, default: "" },
        startDate: { type: String, default: "" },
        endDate: { type: String, default: "" },
        isCurrent: { type: Boolean, default: false },
        description: { type: String, default: "" },
        achievements: { type: [String], default: [] },
    },
    { _id: false },
);

const resumeEducationSchema = new Schema<IResumeEducation>(
    {
        degree: { type: String, default: "" },
        institution: { type: String, default: "" },
        fieldOfStudy: { type: String, default: "" },
        startDate: { type: String, default: "" },
        endDate: { type: String, default: "" },
        isCurrent: { type: Boolean, default: false },
        grade: { type: String, default: "" },
    },
    { _id: false },
);

const resumeSkillSchema = new Schema<IResumeSkill>(
    {
        name: { type: String, default: "" },
        category: { type: String, default: "" },
    },
    { _id: false },
);

// ---- Root schema ----

const resumeSchema = new Schema<IResume>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // one resume draft per user
            index: true,
        },
        personalInfo: {
            type: resumePersonalInfoSchema,
            default: () => ({}),
        },
        summary: {
            type: resumeSummarySchema,
            default: () => ({}),
        },
        experience: {
            type: [resumeExperienceSchema],
            default: [],
        },
        education: {
            type: [resumeEducationSchema],
            default: [],
        },
        skills: {
            type: [resumeSkillSchema],
            default: [],
        },
        templateId: {
            type: String,
            enum: ["classic", "modern", "minimal"],
            default: "classic",
        },
        lastSavedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true },
);

export const ResumeModel: Model<IResume> = mongoose.model<IResume>("Resume", resumeSchema);
