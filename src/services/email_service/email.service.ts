import nodemailer, { Transporter } from "nodemailer";
import { IEmailService } from "./email.service.interface";

export class EmailService implements IEmailService {
    private _transporter: Transporter;
    constructor(service: string, hostEmail: string, pass: string) {
        this._transporter = nodemailer.createTransport({
            service,
            auth: {
                user: hostEmail,
                pass,
            },
        });
    }

    async send(to: string, subject: string, body: string): Promise<void> {
        try {
            const info = await this._transporter.sendMail({
                from: `"No Reply" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                text: body,
            });
            console.log("email OTP send", info.response);
        } catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    }
}

