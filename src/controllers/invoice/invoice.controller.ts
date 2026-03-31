import { NextFunction, Request, Response } from "express";
import { IInvoiceService } from "../../shared/services/invoice-service/invoice.service.interface";
import { IInvoiceController } from "./invoice.controller.interface";
import { ValidationError } from "../../errors-classes/validation.error";
import { AuthError } from "../../errors-classes/auth.error";
import { HTTP_MESSAGES } from "../../constants/messages/http.messages.constants";
import { ApiResponse } from "../../utils/apiResponse.utils";
import { INVOICE_MESSAGES } from "../../constants/messages/invoice.messages";

export class InvoiceController implements IInvoiceController {
    constructor(private readonly _invoiceService: IInvoiceService) {}

    
    async getInvoiceBySubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const { subscriptionId } = req.params;
            const companyId = req.user?.id;

            const invoice = await this._invoiceService.getInvoiceBySubscription(subscriptionId);

            if (!invoice) {
                throw new ValidationError(INVOICE_MESSAGES.NOT_FOUND, 404);
            }

            if (invoice.companyId.toString() !== companyId) {
                throw new AuthError(HTTP_MESSAGES.FORBIDDEN, 403);
            }

            return ApiResponse.success(res, INVOICE_MESSAGES.FETCH_SUCCESSFULL, invoice);
        } catch (error) {
            next(error);
        }
    }

    
    async downloadInvoicePDF(req: Request, res: Response, next: NextFunction) {
        try {
            const { invoiceId } = req.params;
            const companyId = req.user?.id;

            const invoice = await this._invoiceService.getInvoiceById(invoiceId);

            if (!invoice) {
                throw new ValidationError(INVOICE_MESSAGES.NOT_FOUND, 404);
            }

            if (invoice.companyId.toString() !== companyId) {
                throw new AuthError(HTTP_MESSAGES.FORBIDDEN, 403);
            }

            const { stream, fileName, contentType, contentLength } =
                await this._invoiceService.downloadInvoicePDF(invoiceId);

            res.setHeader("Content-Type", contentType);
            res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

            if (contentLength) {
                res.setHeader("Content-Length", contentLength);
            }

            stream.pipe(res);
        } catch (error) {
            next(error);
        }
    }

    
    async getCompanyInvoices(req: Request, res: Response, next: NextFunction) {
        try {
            const companyId = req.user?.id;

            if (!companyId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401);
            }

            const invoices = await this._invoiceService.getInvoicesByCompany(companyId);

            return ApiResponse.success(res, INVOICE_MESSAGES.FETCH_SUCCESSFULL, invoices);
        } catch (error) {
            next(error);
        }
    }

    
    async viewInvoicePDF(req: Request, res: Response, next: NextFunction) {
        try {
            const { invoiceId } = req.params;

            const companyId = req.user?.id;

            const invoice = await this._invoiceService.getInvoiceById(invoiceId);

            if (!invoice) {
                throw new ValidationError(INVOICE_MESSAGES.NOT_FOUND, 404);
            }

            if (invoice.companyId.toString() !== companyId) {
                throw new AuthError(HTTP_MESSAGES.FORBIDDEN, 403);
            }

            const { stream, fileName, contentType, contentLength } =
                await this._invoiceService.downloadInvoicePDF(invoiceId);

            res.setHeader("Content-Type", contentType);
            res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

            if (contentLength) {
                res.setHeader("Content-Length", contentLength);
            }

            stream.pipe(res);
        } catch (error) {
            next(error);
        }
    }
}
