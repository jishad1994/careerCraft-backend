// subscription.schema.ts
import mongoose, { Model, Schema } from "mongoose";
import { ISubscriptionPlan } from "./subscription.interface";

const subscriptionLimitsSchema = new Schema(
    {
        jobs: {
            type: Number,
            required: true,
            min: [0, "Jobs limit cannot be negative"],
            default: 0,
        },
        resumeViews: {
            type: Number,
            required: true,
            min: [0, "Resume views limit cannot be negative"],
            default: 0,
        },
        featuredJobs: {
            type: Number,
            required: true,
            min: [0, "Featured jobs limit cannot be negative"],
            default: 0,
        },
    },
    { _id: false }
);

const subscriptionFeaturesSchema = new Schema(
    {
        chat: {
            type: Boolean,
            required: true,
            default: false,
        },
        videoCall: {
            type: Boolean,
            required: true,
            default: false,
        },
        analytics: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    { _id: false }
);

const subscriptionPlanSchema = new mongoose.Schema<ISubscriptionPlan>(
    {
        name: {
            type: String,
            required: [true, "Plan name is required"],
            unique: true,
            // enum: {
            //     values: Object.values(PlanName),
            //     message: "{VALUE} is not a valid plan name",
            // },
            index: true,
        },
        price: {
            type: Number,
            required: [
                function (this: ISubscriptionPlan) {
                    return this.name !== 'free';
                },
                "Price is required for non-free plans",
            ],
            min: [0, "Price cannot be negative"],
            validate: {
                validator: function (this: ISubscriptionPlan, value: number) {
                    // Free plans should have 0 price
                    if (this.name === 'free'||this.name === 'Free') {
                        return value === 0;
                    }
                    return value > 0;
                },
                message: "Free plans must have 0 price, paid plans must have price > 0",
            },
        },
        durationInDays: {
            type: Number,
            required: [true, "Duration is required"],
            min: [1, "Duration must be at least 1 day"],
        },
        limits: {
            type: subscriptionLimitsSchema,
            required: true,
        },
        features: {
            type: subscriptionFeaturesSchema,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);



export const SubscriptionPlan: Model<ISubscriptionPlan> = mongoose.model<ISubscriptionPlan>(
    "SubscriptionPlan",
    subscriptionPlanSchema
);