import { IAddress, IEducation, IExperience, IUser } from "./user.interface";
import mongoose, { Schema } from "mongoose";

export const EducationSchema = new Schema<IEducation>({
    type: {
        type: String,
        enum: ["Degree", "Diploma", "High School", "PhD", "Certification"],
        required: true,
    },
    institution: {
        type: String,
        required: true,
    },
    fieldOfStudy: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: Date,
    isCurrent: {
        type: Boolean,
        default: false,
    },
    grade: String,
});

export const experienceSchema = new Schema<IExperience>({
    jobTitle: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: Date,
    isCurrent: {
        type: Boolean,
        default: false,
    },
    description: String,
});

//adrress schema

export const addressSchema = new Schema<IAddress>({
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    postalCode: {
        type: String,
        required: true,
    },
});

export const userSchema = new Schema<IUser>(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: false,
            default: "",
        },
        phone: {
            type: String,
            unique: true,
            sparse: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            default: "user",
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        profilePicture: String,
        resumeURL: [String],
        about: String,
        skills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
        education: [EducationSchema],
        experience: [experienceSchema],
        location: String,
        jobsApplied: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
        address: addressSchema,
    },
    { timestamps: true }
);
