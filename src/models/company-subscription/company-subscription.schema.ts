// company-subscription.schema.ts
import mongoose, { Model, Schema } from "mongoose";
import { IAddon, ICompanySubscription, SubscriptionStatus } from "./company-subscription.interface";
import logger from "../../utils/logger";

const usageSchema = new Schema(
    {
        jobsPosted: {
            type: Number,
            default: 0,
            min: [0, "Usage cannot be negative"],
        },
        resumesViewed: {
            type: Number,
            default: 0,
            min: [0, "Usage cannot be negative"],
        },
        featuredUsed: {
            type: Number,
            default: 0,
            min: [0, "Usage cannot be negative"],
        },
        lastResetAt: {
            type: Date,
        },
    },
    { _id: false },
);

const snapshotLimitsSchema = new Schema(
    {
        jobs: {
            type: Number,
            required: true,
            min: 0,
        },
        resumeViews: {
            type: Number,
            required: true,
            min: 0,
        },
        featuredJobs: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false },
);

const snapshotFeaturesSchema = new Schema(
    {
        chat: {
            type: Boolean,
            required: true,
        },
        videoCall: {
            type: Boolean,
            required: true,
        },
        analytics: {
            type: Boolean,
            required: true,
        },
    },
    { _id: false },
);

const snapShotSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        durationInDays: {
            type: Number,
            required: true,
            min: 1,
        },
        limits: {
            type: snapshotLimitsSchema,
            required: true,
        },
        features: {
            type: snapshotFeaturesSchema,
            required: true,
        },
    },
    { _id: false },
);

const addonSchema = new Schema<IAddon>(
    {
        addonId: {
            type: Schema.Types.ObjectId,
            ref: "SubscriptionAddon",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["jobs", "resumeViews", "featuredJobs"],
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        purchasedAt: {
            type: Date,
            default: Date.now,
        },
        paymentId: {
            type: Schema.Types.ObjectId,
            ref: "Payment",
        },
    },
    { _id: true, timestamps: true },
);

export const companySubscriptionSchema = new Schema<ICompanySubscription>(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: [true, "Company ID is required"],
            index: true,
        },
        planId: {
            type: Schema.Types.ObjectId,
            ref: "SubscriptionPlan",
            required: [true, "Plan ID is required"],
            index: true,
        },
        status: {
            type: String,
            enum: {
                values: Object.values(SubscriptionStatus),
                message: "{VALUE} is not a valid subscription status",
            },
            default: SubscriptionStatus.PENDING,
            index: true,
        },
        paymentId: {
            type: Schema.Types.ObjectId,
            ref: "Payment",
            required: [true, "Payment ID is required"],
            index: true,
        },
        startDate: {
            type: Date,
            required: [true, "Start date is required"],
            index: true,
        },
        endDate: {
            type: Date,
            required: [true, "End date is required"],
            index: true,
            validate: {
                validator: function (this: ICompanySubscription, value: Date) {
                    return this.startDate < value;
                },
                message: "Subscription end date should be greater than starting date",
            },
        },
        usage: {
            type: usageSchema,
            default: () => ({
                jobsPosted: 0,
                resumesViewed: 0,
                featuredUsed: 0,
            }),
        },
        cancelledAt: {
            type: Date,
            validate: {
                validator: function (this: ICompanySubscription, value: Date) {
                    if (!value) return true;
                    return this.status === SubscriptionStatus.CANCELLED;
                },
                message: "Cancelled date can only be set when status is cancelled",
            },
        },
        cancelReason: {
            type: String,
            trim: true,
            maxlength: [500, "Cancel reason cannot exceed 500 characters"],
        },
        snapShot: {
            type: snapShotSchema,
            required: [true, "Subscription snapshot is required"],
        },
        autoRenew: {
            type: Boolean,
            default: false,
        },

        //queue system

        isQueued: {
            type: Boolean,
            default: false,
            index: true,
        },
        queuePosition: {
            type: Number,
            default: 0,
            index: true,
        },
        queuedAt: {
            type: Date,
        },
        scheduledStartDate: {
            type: Date,
            index: true,
        },
        activatedAt: {
            type: Date,
        },
        previousSubscriptionId: {
            type: Schema.Types.ObjectId,
            ref: "CompanySubscription",
            index: true,
        },

        // ADDON SYSTEM
        addons: {
            type: [addonSchema],
            default: [],
        },
        addonLimits: {
            jobs: {
                type: Number,
                default: 0,
                min: 0,
            },
            resumeViews: {
                type: Number,
                default: 0,
                min: 0,
            },
            featuredJobs: {
                type: Number,
                default: 0,
                min: 0,
            },
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Compound Indexes for common queries
// companySubscriptionSchema.index({ companyId: 1, status: 1 });
// companySubscriptionSchema.index({ companyId: 1, endDate: -1 });
// companySubscriptionSchema.index({ status: 1, endDate: 1 }); // For expiry checks
// companySubscriptionSchema.index({ endDate: 1, autoRenew: 1 }); // For renewal processing

// Unique constraint: one active subscription per company
// companySubscriptionSchema.index(
//     { companyId: 1 },
//     {
//         unique: true,
//         partialFilterExpression: { status: SubscriptionStatus.ACTIVE },
//     },
// );

// Virtual: Days remaining
companySubscriptionSchema.virtual("daysRemaining").get(function (this: ICompanySubscription) {
    const now = new Date();
    const end = new Date(this.endDate);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// Virtual: Is expired
companySubscriptionSchema.virtual("isExpired").get(function (this: ICompanySubscription) {
    return new Date() > new Date(this.endDate);
});

// Instance Methods
companySubscriptionSchema.methods.isActive = function (this: ICompanySubscription): boolean {
    return (
        this.status === SubscriptionStatus.ACTIVE &&
        new Date() >= new Date(this.startDate) &&
        new Date() <= new Date(this.endDate)
    );
};

companySubscriptionSchema.methods.hasExpired = function (this: ICompanySubscription): boolean {
    return new Date() > new Date(this.endDate);
};

companySubscriptionSchema.methods.canUseFeature = function (
    this: ICompanySubscription,
    feature: keyof ICompanySubscription["snapShot"]["features"],
): boolean {
    return this.isActive() && this.snapShot.features[feature] === true;
};

companySubscriptionSchema.methods.getRemainingLimits = function (this: ICompanySubscription) {
    return {
        jobs: Math.max(0, this.snapShot.limits.jobs - this.usage.jobsPosted),
        resumeViews: Math.max(0, this.snapShot.limits.resumeViews - this.usage.resumesViewed),
        featuredJobs: Math.max(0, this.snapShot.limits.featuredJobs - this.usage.featuredUsed),
    };
};

companySubscriptionSchema.methods.incrementUsage = async function (
    this: ICompanySubscription,
    type: "jobsPosted" | "resumesViewed" | "featuredUsed",
): Promise<void> {
    const limitMap = {
        jobsPosted: "jobs",
        resumesViewed: "resumeViews",
        featuredUsed: "featuredJobs",
    } as const;

    const limitKey = limitMap[type];
    const currentUsage = this.usage[type];
    const limit = this.snapShot.limits[limitKey];

    if (currentUsage >= limit) {
        throw new Error(`${type} limit exceeded. Current: ${currentUsage}, Limit: ${limit}`);
    }

    this.usage[type] = currentUsage + 1;
    await this.save();
};

// Static Methods
companySubscriptionSchema.statics.findActiveByCompany = function (companyId: mongoose.Types.ObjectId) {
    return this.findOne({
        companyId,
        status: SubscriptionStatus.ACTIVE,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
    });
};

companySubscriptionSchema.statics.findExpiredSubscriptions = function () {
    return this.find({
        status: SubscriptionStatus.ACTIVE,
        endDate: { $lt: new Date() },
    });
};

// Pre-save Middleware
companySubscriptionSchema.pre("save", function (next) {
    // Auto-update status based on dates
    if (this.isModified("endDate") || this.isNew) {
        const now = new Date();

        if (now > this.endDate && this.status === SubscriptionStatus.ACTIVE) {
            this.status = SubscriptionStatus.EXPIRED;
        }
    }

    // Set cancelledAt when status changes to cancelled
    if (this.isModified("status") && this.status === SubscriptionStatus.CANCELLED && !this.cancelledAt) {
        this.cancelledAt = new Date();
    }

    next();
});

// Post-save Middleware - for logging or notifications
companySubscriptionSchema.post("save", function (doc) {
    if (doc.status === SubscriptionStatus.EXPIRED) {
        // Trigger notification or event
        logger.info(`Subscription ${doc._id} has expired for company ${doc.companyId}`);
    }
});

export const CompanySubscription: Model<ICompanySubscription> = mongoose.model<ICompanySubscription>(
    "CompanySubscription",
    companySubscriptionSchema,
);
