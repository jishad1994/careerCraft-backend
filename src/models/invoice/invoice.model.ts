// invoice.schema.ts
import mongoose, { Model, Schema } from "mongoose";
import { IInvoice, IInvoiceItem, InvoiceStatus } from "./invoice.interface";

const invoiceItemSchema = new Schema(
    {
        description: {
            type: String,
            required: true,
            trim: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"],
        },
        unitPrice: {
            type: Number,
            required: true,
            min: [0, "Unit price cannot be negative"],
        },
        amount: {
            type: Number,
            required: true,
            min: [0, "Amount cannot be negative"],
        },
    },
    { _id: false },
);

const companyDetailsSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: String,
        address: {
            
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
        },
        gstin: String,
    },
    { _id: false },
);

const invoiceSchema = new Schema<IInvoice>(
    {
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },
        subscriptionId: {
            type: Schema.Types.ObjectId,
            ref: "CompanySubscription",
            required: true,
            index: true,
        },
        paymentId: {
            type: Schema.Types.ObjectId,
            ref: "Payment",
            required: true,
            index: true,
        },
        issueDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        dueDate: {
            type: Date,
            required: true,
        },
        paidDate: {
            type: Date,
        },
        subtotal: {
            type: Number,
            required: true,
            min: [0, "Subtotal cannot be negative"],
        },
        tax: {
            type: Number,
            required: true,
            min: [0, "Tax cannot be negative"],
            default: 0,
        },
        taxRate: {
            type: Number,
            required: true,
            min: [0, "Tax rate cannot be negative"],
            max: [100, "Tax rate cannot exceed 100%"],
            default: 0,
        },
        discount: {
            type: Number,
            min: [0, "Discount cannot be negative"],
            default: 0,
        },
        total: {
            type: Number,
            required: true,
            min: [0, "Total cannot be negative"],
        },
        items: {
            type: [invoiceItemSchema],
            required: true,
            validate: {
                validator: function (items: IInvoiceItem[]) {
                    return items && items.length > 0;
                },
                message: "Invoice must have at least one item",
            },
        },
        status: {
            type: String,
            enum: Object.values(InvoiceStatus),
            default: InvoiceStatus.DRAFT,
            index: true,
        },
        companyDetails: {
            type: companyDetailsSchema,
            required: true,
        },
        pdfUrl: {
            type: String,
        },
        pdfKey: {
            type: String,
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [1000, "Notes cannot exceed 1000 characters"],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Static method to generate unique invoice number
invoiceSchema.statics.generateInvoiceNumber = async function (): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    const prefix = `INV-${year}${month}`;

    const lastInvoice = await this.findOne({
        invoiceNumber: new RegExp(`^${prefix}`),
    })
        .sort({ invoiceNumber: -1 })
        .select("invoiceNumber");

    let sequence = 1;
    if (lastInvoice) {
        const lastSequence = parseInt(lastInvoice.invoiceNumber.split("-")[2]);
        sequence = lastSequence + 1;
    }

    const sequenceStr = String(sequence).padStart(4, "0");
    return `${prefix}-${sequenceStr}`;
};

invoiceSchema.pre("save", function (next) {
    const calculatedSubtotal = this.items.reduce((sum, item) => sum + item.amount, 0);

    if (Math.abs(this.subtotal - calculatedSubtotal) > 0.01) {
        this.subtotal = calculatedSubtotal;
    }

    const calculatedTax = (this.subtotal * this.taxRate) / 100;
    if (Math.abs(this.tax - calculatedTax) > 0.01) {
        this.tax = calculatedTax;
    }

    const calculatedTotal = this.subtotal + this.tax - this.discount;
    if (Math.abs(this.total - calculatedTotal) > 0.01) {
        this.total = calculatedTotal;
    }

    // Set paidDate when status changes to paid
    if (this.isModified("status") && this.status === InvoiceStatus.PAID && !this.paidDate) {
        this.paidDate = new Date();
    }

    next();
});

export const Invoice: Model<IInvoice> = mongoose.model<IInvoice>("Invoice", invoiceSchema);


export interface InvoiceModelWithStaticMethods extends Model<IInvoice> {
    generateInvoiceNumber(): Promise<string>;
}