import { UserProfileCompletionHelper } from "../../service-helpers/user-profile-completion.helper";
import { addressSchema } from "../common/address.schema";
import { bannerImageSchema, profilePictureSchema } from "../common/common.profile.schema";
import { IDocument, IEducation, IExperience, IUser } from "./user.interface";
import mongoose, { Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

export const educationSchema = new Schema<IEducation>({
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
    endDate: {
        type: Date,
        required: function (this: IExperience) {
            return !this.isCurrent;
        },
    },

    isCurrent: {
        type: Boolean,
        default: false,
    },
    description: String,
});

export const documentSchema = new Schema<IDocument>(
    {
        originalName: { type: String, required: true },
        key: { type: String, required: true },
        size: { type: Number, required: true },
        mimeType: { type: String, required: true },
        signedURL: String,
        uploadedAt: Date,
    },
    { _id: false, timestamps: true },
);

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
        googleId: {
            type: String,
            unique: true,
            sparse: true,
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
            required: function (this: IUser) {
                return !this.googleId;
            },
        },
        provider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },
        role: {
            type: String,
            enum: ["user", "company"],
            required: true,
            default: "user",
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        profilePicture: profilePictureSchema,
        bannerImage: bannerImageSchema,
        certificates: [documentSchema],
        resumeURL: [documentSchema],
        about: String,
        skills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
        education: [educationSchema],
        experience: [experienceSchema],
        totalExperienceYears: {
            type: Number,
            default: 0,
        },
        location: String,
        jobsApplied: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
        address: addressSchema,
    },
    { timestamps: true },
);
// Register the plugin
userSchema.plugin(mongooseLeanVirtuals);
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

userSchema.virtual("profileCompletion").get(function () {
    return UserProfileCompletionHelper.getCompletionPercentage(this);
});
export { addressSchema };
