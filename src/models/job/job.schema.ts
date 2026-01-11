import mongoose, { Model, Schema } from "mongoose";
import { IJob } from "./job.interface";

export const jobSchema = new Schema<IJob>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },

        // recruiter: {
        //     type: Schema.Types.ObjectId,
        //     ref: "Recruiter",
        //     required: true,
        //     index: true,
        // },

        company: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        description: {
            type: String,
            required: true,
        },

        responsibilities: [String],
        requirements: [String],

        employmentType: {
            type: String,
            enum: ["full-time", "part-time", "contract", "internship", "freelance"],
            index: true,
        },

        workMode: {
            type: String,
            enum: ["onsite", "remote", "hybrid"],
            index: true,
        },

        experience: {
            min: { type: Number, default: 0 },
            max: { type: Number },
        },

        salary: {
            min: Number,
            max: Number,
            currency: {
                type: String,
                default: "INR",
            },
            period: {
                type: String,
                enum: ["monthly", "yearly"],
                default: "monthly",
            },
            isHidden: {
                type: Boolean,
                default: false,
            },
        },

        location: {
            country: {
                type: String,
                required: true,
                index: true,
            },
            state: String,
            city: {
                type: String,
                index: true,
            },
        },

        skills: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Skill",
            index: true,
        },

        openings: {
            type: Number,
            default: 1,
            min: 1,
        },

        status: {
            type: String,
            enum: ["draft", "active", "paused", "closed", "expired"],
            default: "draft",
            index: true,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        isFeatured: {
            type: Boolean,
            default: false,
            index: true,
        },

        applicationsCount: {
            type: Number,
            default: 0,
        },

        viewsCount: {
            type: Number,
            default: 0,
        },

        expiresAt: {
            type: Date,
            index: true,
        },
    },
    { timestamps: true }
);

jobSchema.index({
    title: "text",
    slug: "text",
    description: "text",
    // skills: "text",
});

jobSchema.index({ status: 1, isVerified: 1 });
jobSchema.index({ company: 1, createdAt: -1 });

jobSchema.pre("save", function (next) {
    if (!this.expiresAt) {
        this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    next();
});

export const Job: Model<IJob> = mongoose.model<IJob>("Job", jobSchema);
