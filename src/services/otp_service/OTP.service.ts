import { ICache } from "../cache/ICacheService";
import { RedisCacheRepo } from "../../repositories/redis.repository";
import { ITransporter } from "../email_service/ITransporter.Service";
import { IOtpService } from "./IOTP.service";
import { NodeMailerService } from "../email_service/nodemailer.service";
import { CacheService } from "../cache/cache.service";

//transporter Service
const transporterService: ITransporter = new NodeMailerService(
    "gmail",
    process.env.HOST_EMAIL || "jishadkolapurath@gmail.com",
    process.env.EMAIL_PASS || "rcpd qabt rtbs xqtv"
);

//OTP Service

export class OTPService implements IOtpService {
    constructor(private cacheService: ICache, private transporterService: ITransporter) {}

    //generate otp
    async generateOTP(): Promise<number> {
        return Math.floor(100000 + Math.random() * 900000);
    }

    //send OTP

    async sendOTP(to: string, subject: "your one time password", otp: string): Promise<void> {
        try {
            this.transporterService.send(to, subject, otp);
            console.log("OTP SEnd:", otp);
        } catch (error) {
            throw error;
        }
    }

    //verify OTP
    async verifyOTP(otp: string, email: string): Promise<boolean> {
        const storedOTP = await this.cacheService.get(email);
        return storedOTP === otp;
    }
}
