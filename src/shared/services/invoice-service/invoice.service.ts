import { Types } from "mongoose";
import { ValidationError } from "../../../errors-classes/validation.error";
import { IInvoice, IInvoiceItem, InvoiceStatus } from "../../../models/invoice/invoice.interface";
import { ICompanySubscriptionRepository } from "../../../repositories/company-subscription/company-subscription.repository.interface";
import { ICompanyRepository } from "../../../repositories/company/company.repository.interface";
import { IInvoiceRepository } from "../../../repositories/invoice/invoice.repository.interface";
import { IPaymentRepository } from "../../../repositories/payment/payment.repository.interfaces";
import { IFileService } from "../../../services/file-service/interfaces/file.service.interface";
import { IInvoiceService } from "./invoice.service.interface";
import PDFDocument from "pdfkit";
import { getFileLocation, IFileResponse } from "../../../utils/s3-bucket.utils";
import { Readable } from "stream";
import { INVOICE_MESSAGES } from "../../../constants/messages/invoice.messages";

export class InvoiceService implements IInvoiceService {
    private readonly TAX_RATE = 18; // GST 18%

    constructor(
        private readonly _invoiceRepository: IInvoiceRepository,
        private readonly _companyRepository: ICompanyRepository,
        private readonly _subscriptionRepository: ICompanySubscriptionRepository,
        private readonly _paymentRepository: IPaymentRepository,
        private readonly _fileService: IFileService,
    ) {}

    /**
     * Generate invoice for a subscription
     */
    async generateInvoiceForSubscription(subscriptionId: string, paymentId: string): Promise<IInvoice> {
        // Get subscription
        const subscription = await this._subscriptionRepository.findById(subscriptionId);
        if (!subscription) {
            throw new ValidationError("Subscription not found", 404);
        }

        // Get payment
        const payment = await this._paymentRepository.findById(paymentId);
        if (!payment) {
            throw new ValidationError("Payment not found", 404);
        }

        // Get company details
        const company = await this._companyRepository.findById(subscription.companyId.toString());
        if (!company) {
            throw new ValidationError("Company not found", 404);
        }

        // Check if invoice already exists
        const existingInvoice = await this._invoiceRepository.findBySubscriptionId(subscriptionId);
        if (existingInvoice) {
            return existingInvoice;
        }

        // Generate unique invoice number
        const invoiceNumber = await this._invoiceRepository.generateInvoiceNumber();

        // Calculate amounts
        const subtotal = subscription.snapShot.price;
        const taxRate = this.TAX_RATE;
        const tax = (subtotal * taxRate) / 100;
        const total = subtotal + tax;

        // Create invoice items
        const items: IInvoiceItem[] = [
            {
                description: `${subscription.snapShot.name} - Subscription (${subscription.snapShot.durationInDays} days)`,
                quantity: 1,
                unitPrice: subtotal,
                amount: subtotal,
            },
        ];

        // Prepare company details snapshot
        const companyDetails = {
            name: company.name,
            email: company.email,
            phone: company.phone,
            address: company.address && company.address?.length > 0 ? company.address[0] : undefined,
            gstin: company.GSTIN,
        };

        // Create invoice
        const invoice = await this._invoiceRepository.create({
            invoiceNumber,
            companyId: new Types.ObjectId(subscription.companyId),
            subscriptionId: new Types.ObjectId(subscriptionId),
            paymentId: new Types.ObjectId(paymentId),
            issueDate: new Date(),
            dueDate: new Date(), // Immediate payment
            paidDate: new Date(), // Already paid
            subtotal,
            tax,
            taxRate,
            discount: 0,
            total,
            items,
            status: InvoiceStatus.PAID,
            companyDetails,
        });

        // Generate and upload PDF
        await this.uploadInvoicePDF(invoice._id.toString());

        return invoice;
    }

    /**
     * Generate PDF buffer for invoice
     */
    async generateInvoicePDF(invoiceId: string): Promise<Buffer> {
        const invoice = await this._invoiceRepository.findById(invoiceId);
        if (!invoice) {
            throw new ValidationError("Invoice not found", 404);
        }

        const formatCurrency = (amount: number) => {
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount);  
        };

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: "A4",
                margin: 50,
            });

            const chunks: Buffer[] = [];
            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", reject);

            // 🔥 OPTIONAL (recommended for ₹ symbol support)
            // doc.registerFont("Roboto", "path/to/Roboto-Regular.ttf");
            // doc.registerFont("Roboto-Bold", "path/to/Roboto-Bold.ttf");
            // doc.font("Roboto");

            // ================= HEADER =================
            doc.fontSize(20).font("Helvetica-Bold").text("INVOICE", { align: "center" });
            doc.moveDown(0.5);

            doc.fontSize(16).font("Helvetica-Bold").text("CareerCraft", { align: "center" });
            doc.fontSize(10).font("Helvetica").text("Job Portal Platform", { align: "center" });
            doc.text("Email: support@careercraft.com", { align: "center" });
            doc.text("Phone: +91-XXXXXXXXXX", { align: "center" });

            doc.moveDown(1);

            // ================= INVOICE DETAILS =================
            const invoiceY = doc.y;

            doc.fontSize(10).font("Helvetica-Bold").text("Invoice Number:", 50, invoiceY);
            doc.font("Helvetica").text(invoice.invoiceNumber, 150, invoiceY);

            doc.font("Helvetica-Bold").text("Issue Date:", 50, invoiceY + 15);
            doc.font("Helvetica").text(new Date(invoice.issueDate).toLocaleDateString("en-IN"), 150, invoiceY + 15);

            doc.font("Helvetica-Bold").text("Status:", 50, invoiceY + 30);
            doc.font("Helvetica")
                .fillColor(invoice.status === "paid" ? "#16a34a" : "#dc2626")
                .text(invoice.status.toUpperCase(), 150, invoiceY + 30)
                .fillColor("#000000");

            // ================= BILL TO =================
            doc.moveDown(3);

            doc.fontSize(12).font("Helvetica-Bold").text("Bill To:");
            doc.fontSize(10).font("Helvetica").text(invoice.companyDetails.name);
            doc.text(invoice.companyDetails.email);

            if (invoice.companyDetails.phone) {
                doc.text(invoice.companyDetails.phone);
            }

            if (invoice.companyDetails.address) {
                const addr = invoice.companyDetails.address;
                doc.text(`${addr.city}, ${addr.state} - ${addr.postalCode}`);
                doc.text(addr.country);
            }

            if (invoice.companyDetails.gstin) {
                doc.text(`GSTIN: ${invoice.companyDetails.gstin}`);
            }

            doc.moveDown(2);

            // ================= TABLE =================
            const tableTop = doc.y;

            const col1X = 50;
            const col2X = 300;
            const col3X = 380;
            const col4X = 460;

            const col1Width = 240;
            const col2Width = 50;
            const col3Width = 70;
            const col4Width = 80;

            // Header Background
            doc.rect(col1X, tableTop, 495, 25).fillAndStroke("#e5e7eb", "#d1d5db");

            doc.fillColor("#000")
                .font("Helvetica-Bold")
                .fontSize(10)
                .text("Description", col1X, tableTop + 8, { width: col1Width })
                .text("Qty", col2X, tableTop + 8, { width: col2Width, align: "center" })
                .text("Price", col3X, tableTop + 8, { width: col3Width, align: "right" })
                .text("Amount", col4X, tableTop + 8, { width: col4Width, align: "right" });

            let yPosition = tableTop + 30;

            doc.font("Helvetica").fontSize(9);

            invoice.items.forEach((item) => {
                doc.text(item.description, col1X, yPosition, { width: col1Width });

                doc.text(item.quantity.toString(), col2X, yPosition, {
                    width: col2Width,
                    align: "center",
                });

                doc.text(formatCurrency(item.unitPrice), col3X, yPosition, {
                    width: col3Width,
                    align: "right",
                });

                doc.text(formatCurrency(item.amount), col4X, yPosition, {
                    width: col4Width,
                    align: "right",
                });

                // Row divider
                doc.moveTo(col1X, yPosition + 18)
                    .lineTo(545, yPosition + 18)
                    .stroke("#e5e7eb");

                yPosition += 25;
            });

            // ================= TOTALS =================
            yPosition += 10;
            const totalsX = 380;

            doc.font("Helvetica")
                .text("Subtotal:", totalsX, yPosition, { width: 80 })
                .text(formatCurrency(invoice.subtotal), totalsX + 80, yPosition, {
                    width: 80,
                    align: "right",
                });

            yPosition += 20;

            doc.text(`Tax (${invoice.taxRate}%):`, totalsX, yPosition, { width: 80 }).text(
                formatCurrency(invoice.tax),
                totalsX + 80,
                yPosition,
                {
                    width: 80,
                    align: "right",
                },
            );

            if (invoice.discount > 0) {
                yPosition += 20;
                doc.text("Discount:", totalsX, yPosition, { width: 80 }).text(
                    `- ${formatCurrency(invoice.discount)}`,
                    totalsX + 80,
                    yPosition,
                    {
                        width: 80,
                        align: "right",
                    },
                );
            }

            yPosition += 20;

            doc.fontSize(12)
                .font("Helvetica-Bold")
                .text("Total:", totalsX, yPosition, { width: 80 })
                .text(formatCurrency(invoice.total), totalsX + 80, yPosition, {
                    width: 80,
                    align: "right",
                });

            // ================= NOTES =================
            if (invoice.notes) {
                doc.moveDown(2);
                doc.fontSize(10).font("Helvetica-Bold").text("Notes:");
                doc.font("Helvetica").fontSize(9).text(invoice.notes, { width: 495 });
            }

            // ================= FOOTER =================
            doc.fontSize(8).font("Helvetica").text("Thank you for your business!", 50, 750, {
                align: "center",
                width: 495,
            });

            doc.text("This is a computer-generated invoice and does not require a signature.", {
                align: "center",
                width: 495,
            });

            doc.end();
        });
    }
    // async generateInvoicePDF(invoiceId: string): Promise<Buffer> {
    //     const invoice = await this._invoiceRepository.findById(invoiceId);
    //     if (!invoice) {
    //         throw new ValidationError("Invoice not found", 404);
    //     }

    //     return new Promise((resolve, reject) => {
    //         const doc = new PDFDocument({
    //             size: "A4",
    //             margin: 50,
    //         });

    //         const chunks: Buffer[] = [];
    //         doc.on("data", (chunk) => chunks.push(chunk));
    //         doc.on("end", () => resolve(Buffer.concat(chunks)));
    //         doc.on("error", reject);

    //         // Header
    //         doc.fontSize(20).font("Helvetica-Bold").text("INVOICE", { align: "center" });
    //         doc.moveDown(0.5);

    //         // Company Logo/Name
    //         doc.fontSize(16).font("Helvetica-Bold").text("CareerCraft", { align: "center" });
    //         doc.fontSize(10).font("Helvetica").text("Job Portal Platform", { align: "center" });
    //         doc.text("Email: support@careercraft.com", { align: "center" });
    //         doc.text("Phone: +91-XXXXXXXXXX", { align: "center" });
    //         doc.moveDown(1);

    //         // Invoice Details
    //         const invoiceY = doc.y;
    //         doc.fontSize(10).font("Helvetica-Bold").text(`Invoice Number:`, 50, invoiceY);
    //         doc.font("Helvetica").text(invoice.invoiceNumber, 150, invoiceY);

    //         doc.font("Helvetica-Bold").text(`Issue Date:`, 50, invoiceY + 15);
    //         doc.font("Helvetica").text(new Date(invoice.issueDate).toLocaleDateString("en-IN"), 150, invoiceY + 15);

    //         doc.font("Helvetica-Bold").text(`Status:`, 50, invoiceY + 30);
    //         doc.font("Helvetica")
    //             .fillColor(invoice.status === InvoiceStatus.PAID ? "#16a34a" : "#dc2626")
    //             .text(invoice.status.toUpperCase(), 150, invoiceY + 30)
    //             .fillColor("#000000");

    //         // Bill To
    //         doc.moveDown(3);
    //         doc.fontSize(12).font("Helvetica-Bold").text("Bill To:");
    //         doc.fontSize(10).font("Helvetica").text(invoice.companyDetails.name);
    //         doc.text(invoice.companyDetails.email);
    //         if (invoice.companyDetails.phone) {
    //             doc.text(invoice.companyDetails.phone);
    //         }
    //         if (invoice.companyDetails.address) {
    //             const addr = invoice.companyDetails.address;
    //             // if (addr.street) doc.text(addr.street);
    //             doc.text(`${addr.city}, ${addr.state} - ${addr.postalCode}`);
    //             doc.text(addr.country);
    //         }
    //         if (invoice.companyDetails.gstin) {
    //             doc.text(`GSTIN: ${invoice.companyDetails.gstin}`);
    //         }

    //         doc.moveDown(2);

    //         // Table Header
    //         const tableTop = doc.y;
    //         const col1X = 50;
    //         const col2X = 300;
    //         const col3X = 380;
    //         const col4X = 460;

    //         doc.fontSize(10)
    //             .font("Helvetica-Bold")
    //             .fillColor("#1f2937")
    //             .rect(col1X, tableTop, 495, 25)
    //             .fillAndStroke("#e5e7eb", "#d1d5db");

    //         doc.fillColor("#000000")
    //             .text("Description", col1X + 5, tableTop + 8, { width: 240 })
    //             .text("Qty", col2X + 5, tableTop + 8, { width: 50 })
    //             .text("Price", col3X + 5, tableTop + 8, { width: 70 })
    //             .text("Amount", col4X + 5, tableTop + 8, { width: 80 });

    //         // Table Rows
    //         let yPosition = tableTop + 30;
    //         doc.font("Helvetica").fontSize(9);

    //         invoice.items.forEach((item) => {
    //             doc.text(item.description, col1X + 5, yPosition, { width: 240 });
    //             doc.text(item.quantity.toString(), col2X + 5, yPosition, { width: 50 });
    //             doc.text(`₹${item.unitPrice.toFixed(2)}`, col3X + 5, yPosition, { width: 70 });
    //             doc.text(`₹${item.amount.toFixed(2)}`, col4X + 5, yPosition, {
    //                 width: 80,
    //                 align: "right",
    //             });
    //             yPosition += 25;
    //         });

    //         // Totals
    //         yPosition += 10;
    //         const totalsX = 380;

    //         doc.font("Helvetica")
    //             .text("Subtotal:", totalsX, yPosition)
    //             .text(`₹${invoice.subtotal.toFixed(2)}`, totalsX + 80, yPosition, {
    //                 align: "right",
    //                 width: 80,
    //             });

    //         yPosition += 20;
    //         doc.text(`Tax (${invoice.taxRate}%):`, totalsX, yPosition).text(
    //             `₹${invoice.tax.toFixed(2)}`,
    //             totalsX + 80,
    //             yPosition,
    //             { align: "right", width: 80 },
    //         );

    //         if (invoice.discount > 0) {
    //             yPosition += 20;
    //             doc.text("Discount:", totalsX, yPosition).text(
    //                 `-₹${invoice.discount.toFixed(2)}`,
    //                 totalsX + 80,
    //                 yPosition,
    //                 { align: "right", width: 80 },
    //             );
    //         }

    //         yPosition += 20;
    //         doc.fontSize(12)
    //             .font("Helvetica-Bold")
    //             .text("Total:", totalsX, yPosition)
    //             .text(`₹${invoice.total.toFixed(2)}`, totalsX + 80, yPosition, {
    //                 align: "right",
    //                 width: 80,
    //             });

    //         // Notes
    //         if (invoice.notes) {
    //             doc.moveDown(2);
    //             doc.fontSize(10).font("Helvetica-Bold").text("Notes:");
    //             doc.font("Helvetica").fontSize(9).text(invoice.notes, { width: 495 });
    //         }

    //         // Footer
    //         doc.fontSize(8).font("Helvetica").text("Thank you for your business!", 50, 750, {
    //             align: "center",
    //             width: 495,
    //         });
    //         doc.text("This is a computer-generated invoice and does not require a signature.", {
    //             align: "center",
    //             width: 495,
    //         });

    //         doc.end();
    //     });
    // }

    /**
     * Upload invoice PDF to S3 and update invoice record
     */
    async uploadInvoicePDF(invoiceId: string): Promise<string> {
        const invoice = await this._invoiceRepository.findById(invoiceId);
        if (!invoice) {
            throw new ValidationError("Invoice not found", 404);
        }

        // Generate PDF
        const pdfBuffer = await this.generateInvoicePDF(invoiceId);

        const fileName = `${invoice.companyId}/${invoice.invoiceNumber}.pdf`;

        const key = await this._fileService.uploadBuffer(pdfBuffer, "invoices", fileName, "application/pdf");

        const pdfUrl = getFileLocation(key);

        // Update invoice with PDF URL and key
        await this._invoiceRepository.update(invoiceId, {
            pdfUrl,
            pdfKey: key,
        });

        return pdfUrl;
    }

    /**
     * Get invoice by subscription ID
     */
    async getInvoiceBySubscription(subscriptionId: string): Promise<IInvoice | null> {
        const invoice = await this._invoiceRepository.findBySubscriptionId(subscriptionId);

        if (!invoice) {
            throw new ValidationError(INVOICE_MESSAGES.NOT_FOUND, 404);
        }

        return invoice;
    }
    async getInvoiceById(invoiceId: string): Promise<IInvoice | null> {
        const invoice = await this._invoiceRepository.findById(invoiceId);

        if (!invoice) {
            throw new ValidationError(INVOICE_MESSAGES.NOT_FOUND, 404);
        }

        return invoice;
    }

    /**
     * Get all invoices for a company
     */
    async getInvoicesByCompany(companyId: string): Promise<IInvoice[]> {
        return await this._invoiceRepository.findByCompanyId(companyId);
    }

    /**
     * Download invoice PDF
     */
    async downloadInvoicePDF(invoiceId: string): Promise<IFileResponse> {
        const invoice = await this._invoiceRepository.findById(invoiceId);
        if (!invoice) {
            throw new ValidationError("Invoice not found", 404);
        }

        // If PDF exists in S3, download from there
        if (invoice.pdfKey) {
            const file = await this._fileService.getFile(invoice.pdfKey);

            // const buffer = await streamToBuffer(file.Body as Readable);
            return {
                stream: file.Body as Readable,
                contentType: file.ContentType || "application/pdf",
                contentLength: file.ContentLength,
                fileName: `${invoice.invoiceNumber}.pdf`,
            };
        }

        // Otherwise, generate new PDF
        const buffer = await this.generateInvoicePDF(invoiceId);

        return {
            stream: Readable.from(buffer),
            contentType: "application/pdf",
            contentLength: buffer.length,
            fileName: `${invoice.invoiceNumber}.pdf`,
        };
    }
}
