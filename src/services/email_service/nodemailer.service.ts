import nodemailer, { Transporter } from "nodemailer";
import { ITransporter } from "./ITransporter.Service";

export class NodeMailerService implements ITransporter {
    private transporter: Transporter;
    constructor(service: string, hostEmail: string, pass: string) {
        this.transporter = nodemailer.createTransport({
            service,
            auth: {
                user: hostEmail,
                pass,
            },
        });
    }

    async send(to: string, subject: string, body: string): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
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

