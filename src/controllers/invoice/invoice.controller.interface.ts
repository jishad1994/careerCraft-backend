import { Response, Request, NextFunction } from "express";

export interface IInvoiceController {
    getInvoiceBySubscription(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    downloadInvoicePDF(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCompanyInvoices(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    viewInvoicePDF(req: Request, res: Response, next: NextFunction): Promise<void>;
}
