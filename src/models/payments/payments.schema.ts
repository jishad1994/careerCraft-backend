// payment.schema.ts
import mongoose, { Model, Schema } from "mongoose";
import { IPayment, PaymentStatus, PaymentMethod, Currency, PaymentType } from "./payments.interface";

const paymentGatewayResponseSchema = new Schema(
    {
        gatewayName: {
            type: String,
            required: true,
            trim: true,
        },
        
        transactionId: {
            type: String,
            required: true,
            trim: true,
        },
        gatewayStatus: {
            type: String,
            required: true,
        },
        gatewayMessage: {
            type: String,
            trim: true,
        },
        rawResponse: {
            type: Schema.Types.Mixed,
        },
        timestamp: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    { _id: false },
);

const paymentMetadataSchema = new Schema(
    {
        ipAddress: String,
        userAgent: String,
        deviceId: String,
        location: String,
    },
    { _id: false }, )

export const paymentSchema = new Schema<IPayment>(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: [true, "Company ID is required"],
            index: true,
        },
        subscriptionId: {
            type: Schema.Types.ObjectId,
            ref: "CompanySubscription",
            index: true,
        },
        planId: {
            type: Schema.Types.ObjectId,
            ref: "SubscriptionPlan",
            required: [true, "Plan ID is required"],
            index: true,
        },

        // Payment Details
        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [0, "Amount cannot be negative"],
        },
        currency: {
            type: String,
            enum: {
                values: Object.values(Currency),
                message: "{VALUE} is not a valid currency",
            },
            required: [true, "Currency is required"],
            default: Currency.USD,
        },
        paymentMethod: {
            type: String,
            enum: {
                values: Object.values(PaymentMethod),
                message: "{VALUE} is not a valid payment method",
            },
            required: [true, "Payment method is required"],
            index: true,
        },
        paymentType: {
            type: String,
            enum: {
                values: Object.values(PaymentType),
                message: "{VALUE} is not a valid payment type",
            },
            required: [true, "Payment type is required"],
            default: PaymentType.SUBSCRIPTION,
        },
        status: {
            type: String,
            enum: {
                values: Object.values(PaymentStatus),
                message: "{VALUE} is not a valid payment status",
            },
            default: PaymentStatus.PENDING,
            index: true,
        },

        // Transaction Details
        transactionId: {
            type: String,
            trim: true,
            sparse: true,
            index: true,
        },
        invoiceNumber: {
            type: String,
            unique: true,
            trim: true,
            index: true,
        },
        receiptUrl: {
            type: String,
            trim: true,
        },

        // Gateway Information
        gatewayResponse: {
            type: paymentGatewayResponseSchema,
        },

        // Dates
        paidAt: {
            type: Date,
            index: true,
        },
        failedAt: {
            type: Date,
        },
       
        // Additional Info
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
        },
        metadata: {
            type: paymentMetadataSchema,
        },
        failureReason: {
            type: String,
            trim: true,
            maxlength: [500, "Failure reason cannot exceed 500 characters"],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

export const Payment: Model<IPayment> = mongoose.model<IPayment>("Payment", paymentSchema);
