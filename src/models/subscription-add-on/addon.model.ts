import mongoose, { Model, Schema } from "mongoose";
import { ISubscriptionAddon } from "./addon.interface";

const subscriptionAddonSchema = new Schema<ISubscriptionAddon>(
    {
        name: {
            type: String,
            required: [true, "Addon name is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
        },
        type: {
            type: String,
            enum: {
                values: ["jobs", "resumeViews", "featuredJobs"],
                message: "{VALUE} is not a valid addon type",
            },
            required: [true, "Addon type is required"],
            index: true,
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"],
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);
subscriptionAddonSchema.index({ type: 1, isActive: 1 });

export const SubscriptionAddon: Model<ISubscriptionAddon> = mongoose.model<ISubscriptionAddon>(
    "SubscriptionAddon",
    subscriptionAddonSchema,
);
