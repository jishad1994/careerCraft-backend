// invoice.interface.ts
import mongoose, { Document, Types } from "mongoose";
import { IAddress } from "../user/user.interface";

export enum InvoiceStatus {
    DRAFT = "draft",
    ISSUED = "issued",
    PAID = "paid",
    CANCELLED = "cancelled",
}

export interface IInvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

export interface IInvoice extends Document<mongoose.Types.ObjectId> {
    _id: Types.ObjectId;
    invoiceNumber: string;
    companyId: Types.ObjectId;
    subscriptionId: Types.ObjectId;
    paymentId: Types.ObjectId;

    // Invoice details
    issueDate: Date;
    dueDate: Date;
    paidDate?: Date;

    // Amounts
    subtotal: number;
    tax: number;
    taxRate: number;
    discount: number;
    total: number;

    // Items
    items: IInvoiceItem[];

    // Status
    status: InvoiceStatus;

    // Company details (snapshot)
    companyDetails: {
        name: string;
        email: string;
        phone?: string;
        address?: IAddress
        gstin?: string;
    };

    // PDF storage
    pdfUrl?: string;
    pdfKey?: string;

    // Notes
    notes?: string;

    createdAt: Date;
    updatedAt: Date;

    
}
