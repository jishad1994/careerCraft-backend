import { IInvoice } from "../../models/invoice/invoice.interface";

export interface IInvoiceRepository  {
    create(data: Partial<IInvoice>): Promise<IInvoice>;
    findById(id: string): Promise<IInvoice | null>;
    findByInvoiceNumber(invoiceNumber: string): Promise<IInvoice | null>;
    findBySubscriptionId(subscriptionId: string): Promise<IInvoice | null>;
    findByPaymentId(paymentId: string): Promise<IInvoice | null>;
    findByCompanyId(companyId: string): Promise<IInvoice[]>;
    update(id: string, data: Partial<IInvoice>): Promise<IInvoice | null>;
    generateInvoiceNumber(): Promise<string>;
}
