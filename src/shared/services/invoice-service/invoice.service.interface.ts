import { IInvoice } from "../../../models/invoice/invoice.interface";
import { IFileResponse } from "../../../utils/s3-bucket.utils";

export interface IInvoiceService {
    generateInvoiceForSubscription(subscriptionId: string, paymentId: string): Promise<IInvoice>;
    generateInvoicePDF(invoiceId: string): Promise<Buffer>;
    uploadInvoicePDF(invoiceId: string): Promise<string>;
    getInvoiceById(invoiceId: string): Promise<IInvoice | null>;
    getInvoiceBySubscription(subscriptionId: string): Promise<IInvoice | null>;
    getInvoicesByCompany(companyId: string): Promise<IInvoice[]>;
    downloadInvoicePDF(invoiceId: string): Promise<IFileResponse>;
}
