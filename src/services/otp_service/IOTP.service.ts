export interface IOtpService {
    generateOTP(): Promise<number>;
    sendOTP(to: string, subject: string, otp: string): Promise<void>;
    verifyOTP(otp: string, email: string): Promise<boolean>;
}
