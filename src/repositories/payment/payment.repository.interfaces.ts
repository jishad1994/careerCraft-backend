import { IPayment, PaymentStatus } from "../../models/payments/payments.interface";
import { IBaseRepository } from "../base-repository/base.repository.inteface";

export interface IPaymentRepository extends IBaseRepository<IPayment> {
    findBySubscription(subscriptionId: string): Promise<IPayment[]>;
    findByCompany(companyId: string): Promise<IPayment[]>;
    updateStatus(id: string, status: PaymentStatus, additionalData?: Partial<IPayment>): Promise<IPayment | null>;
    findPendingBySubscription(subscriptionId: string): Promise<IPayment | null>;
    findByInvoiceNumber(invoiceNumber: string): Promise<IPayment | null>;
}
