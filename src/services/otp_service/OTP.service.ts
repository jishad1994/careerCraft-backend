import { ICache } from "../cache/cache.service.interface";
import { ITransporter } from "../email_service/ITransporter.Service";
import { IOtpService } from "./otp.service.interface";

//OTP Service

export class OTPService implements IOtpService {
    constructor(private cacheService: ICache, private transporterService: ITransporter) {}

    //generate otp
    async generateOTP(): Promise<number> {
        return Math.floor(100000 + Math.random() * 900000);
    }

    //send OTP

    async sendOTP(to: string, subject: "your one time password", otp: string): Promise<void> {
        // eslint-disable-next-line no-useless-catch
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
