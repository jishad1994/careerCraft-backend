import { Model, Types } from "mongoose";
import { IPayment, PaymentStatus } from "../../models/payments/payments.interface";
import { BaseRepository } from "../base-repository/base.repository";
import { IPaymentRepository } from "./payment.repository.interfaces";

export class PaymentRepository extends BaseRepository<IPayment> implements IPaymentRepository {
    constructor(protected readonly model: Model<IPayment>) {
        super(model);
    }

    async findBySubscription(subscriptionId: string): Promise<IPayment[]> {
        return await this.model
            .find({ subscriptionId: new Types.ObjectId(subscriptionId) })
            .sort({ createdAt: -1 })
            
    }

    async findByCompany(companyId: string): Promise<IPayment[]> {
        return await this.model
            .find({ companyId: new Types.ObjectId(companyId) })
            .sort({ createdAt: -1 })
           
    }

    async updateStatus(id: string, status: PaymentStatus, additionalData?: Partial<IPayment>): Promise<IPayment | null> {
        const updateData: Partial<IPayment> & { status: PaymentStatus } = { status, ...additionalData };
        if (status === PaymentStatus.COMPLETED) {
            updateData.paidAt = new Date();
        } else if (status === PaymentStatus.FAILED) {
            updateData.failedAt = new Date();
        }

        return await this.model.findByIdAndUpdate(id, updateData, { new: true });
    }

    async findPendingBySubscription(subscriptionId: string): Promise<IPayment | null> {
        return this.model
            .findOne({
                subscriptionId: new Types.ObjectId(subscriptionId),
                status: { $in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING] },
            })
            
    }

    async findByInvoiceNumber(invoiceNumber: string): Promise<IPayment | null> {
        return this.model.findOne({ invoiceNumber });
    }
}
