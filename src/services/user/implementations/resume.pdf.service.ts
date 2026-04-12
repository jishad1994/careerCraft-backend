// ============================================================
// PDF Generation Service (Puppeteer)
// ============================================================

import puppeteer, { Browser } from "puppeteer";
import { IResumeData } from "../../../models/resume/resume.interface";
import { renderResumeHtml } from "../../../utils/resume.templates";
import { AppError } from "../../../errors-classes/app.error.";
import { IResumePDFService } from "../interfaces/resume.pdf.service.interface";

export class PdfGenerationService implements IResumePDFService {
    private browser: Browser | null = null;

    private async getBrowser(): Promise<Browser> {
        if (!this.browser || !this.browser.connected) {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
            });
        }
        return this.browser;
    }

    async generatePdf(resumeData: IResumeData): Promise<Buffer> {
        const html = renderResumeHtml(resumeData);

        const browser = await this.getBrowser();
        const page = await browser.newPage();

        try {
            await page.setContent(html, {
                waitUntil: "networkidle0",
                timeout: 15000,
            });

            const pdfUint8Array = await page.pdf({
                format: "A4",
                printBackground: true,
                margin: {
                    top: "0px",
                    bottom: "0px",
                    left: "0px",
                    right: "0px",
                },
            });

            return Buffer.from(pdfUint8Array);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new AppError(`PDF generation failed: ${message}`, 400);
        } finally {
            await page.close();
        }
    }

    async cleanup(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}
