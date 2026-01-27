// payment.interface.ts
import mongoose, { Document } from "mongoose";

export enum PaymentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}

export enum PaymentMethod {
    CREDIT_CARD = "credit_card",
    DEBIT_CARD = "debit_card",
    PAYPAL = "paypal",
    STRIPE = "stripe",
    BANK_TRANSFER = "bank_transfer",
    UPI = "upi",
    WALLET = "wallet"
}

export enum Currency {
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP",
    INR = "INR",
    AED = "AED"
}

export enum PaymentType {
    SUBSCRIPTION = "subscription",
    RENEWAL = "renewal",
    UPGRADE = "upgrade",
    DOWNGRADE = "downgrade",
    ONE_TIME = "one_time"
}

export interface IPaymentMetadata {
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    location?: string;
}



export interface IPaymentGatewayResponse {
    gatewayName: string;
    transactionId: string;
    gatewayStatus: string;
    gatewayMessage?: string;
    timestamp: Date;
}

export interface IPayment extends Document<mongoose.Types.ObjectId> {
    companyId: mongoose.Types.ObjectId;
    subscriptionId: mongoose.Types.ObjectId;
    planId: mongoose.Types.ObjectId;
    
    // Payment Details
    amount: number;
    currency: Currency;
    paymentMethod: PaymentMethod;
    paymentType: PaymentType;
    status: PaymentStatus;
    
    // Transaction Details
    transactionId?: string;
    invoiceNumber?: string;
    receiptUrl?: string;
    
    // Gateway Information
    gatewayResponse?: IPaymentGatewayResponse;
    
   
    // Dates
    paidAt?: Date;
    failedAt?: Date;
    
    // Additional Info
    description?: string;
    metadata?: IPaymentMetadata;
    failureReason?: string;
    
    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    
 
}

