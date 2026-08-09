import { Model } from "mongoose";
import { IInvoice } from "../../models/invoice/invoice.interface";
import { IInvoiceRepository } from "./invoice.repository.interface";
import { InvoiceModelWithStaticMethods } from "../../models/invoice/invoice.model";

export class InvoiceRepository implements IInvoiceRepository {
    constructor(private readonly model: Model<IInvoice>) {}

    async create(data: Partial<IInvoice>): Promise<IInvoice> {
        return await this.model.create(data);
    }

    async findById(id: string): Promise<IInvoice | null> {
        return await this.model.findById(id);
    }

    async findByInvoiceNumber(invoiceNumber: string): Promise<IInvoice | null> {
        return await this.model.findOne({ invoiceNumber });
    }

    async findBySubscriptionId(subscriptionId: string): Promise<IInvoice | null> {
        return await this.model.findOne({ subscriptionId });
    }

    async findByPaymentId(paymentId: string): Promise<IInvoice | null> {
        return await this.model.findOne({ paymentId });
    }

    async findByCompanyId(companyId: string): Promise<IInvoice[]> {
        return await this.model.find({ companyId }).sort({ createdAt: -1 })
    }

    async update(id: string, data: Partial<IInvoice>): Promise<IInvoice | null> {
        return await this.model.findByIdAndUpdate(id, data, { new: true });
    }

    async generateInvoiceNumber(): Promise<string> {
        return await (this.model as InvoiceModelWithStaticMethods).generateInvoiceNumber();
    }
}
