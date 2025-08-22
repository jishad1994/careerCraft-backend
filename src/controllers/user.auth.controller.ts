import { Request, Response } from "express";
import { HTTP_STATUS, HTTP_MESSAGES } from "../constants/http.constants";
import bcrypt from "bcrypt";
import { IUserAuthService } from "../services/user/user.auth.service.interface";
import { IOtpService } from "../services/otp_service/IOTP.service";
import { ICache } from "../services/cache/ICacheService";
import { TempUserData } from "../interfaces/auth.interface";

export class UserAuthController {
    constructor(private userAuthService: IUserAuthService, private otpService: IOtpService, private cacheService: ICache) {}
    //signup controller
    async userSignupController(req: Request, res: Response) {
        try {
            const { firstName, lastName, phone, email, password } = req.body;
            const user = await this.userAuthService.signupUser(firstName, lastName, phone, email, password);
            return res.status(HTTP_STATUS.CREATED).json({ success: true, messsage: "user registration successfull", user });
        } catch (error: any) {
            console.log(error.message);
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: error.message });
        }
    }

    //check phone exists
    async checkUserPhoneExists(req: Request, res: Response) {
        try {
            const { phone } = req.params;
            const result = await this.userAuthService.checkPhoneOrEmailExists(phone); //returns an object {exists:boolean}
            return res.status(HTTP_STATUS.OK).json({ success: true, message: null, ...result });
        } catch (error: any) {
            console.log(error.message);
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: error?.message });
        }
    }

    //check user email exists
    async checkUserEmailTaken(req: Request, res: Response) {
        try {
            const { email } = req.params;
            console.log(email);
            const result = await this.userAuthService.checkPhoneOrEmailExists(email);
            return res.status(200).json({ success: true, message: null, ...result });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error?.message });
        }
    }

    //send OTP controller
    async requestOTP(req: Request, res: Response) {
        try {
            //sanitize data from the request body
            const { firstName, lastName, phone, email, password } = req.body;
            const user = { firstName, lastName, phone, email, password };

            //generate OTP
            const otp: string = (await this.otpService.generateOTP()).toString();

            //hash OTP
            const otpHashed: string = await bcrypt.hash(otp, 10);

            const hashedPassword: string = await bcrypt.hash(password, 10); //hash password

            //update user.password with hashed password
            user.password = hashedPassword;

            //save user along with hashed OTP in the cache emai id as key with 300 seconds ttl
            this.cacheService.set(email, { ...user, otpHashed }, 300);

            //send generated OTP
            let emailSubject = "your onetime password";
            this.otpService.sendOTP(email, "your one time password", otp);

            //retturn response

            return res.status(200).json({ success: true, message: "OTP send to email", email });
        } catch (error: unknown) {
            console.log(error);
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }

    // verify OTP

    async verifyOTP(req: Request, res: Response) {
        try {
            const { otp, email } = req.body;

            if (!otp || !email) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "otp or email is not found " });
            }

            //find the stored user authentication data from the cache servie
            const tempUserData: TempUserData | null = await this.cacheService.get(email);

            if (!tempUserData) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json({ success: false, message: "OTP has expires,please try again" });
            }

            //extract hashed otp
            const otpHashed = tempUserData?.otpHashed;
            //find verifaication status
            const verificationStatus = await bcrypt.compare(otp, otpHashed);

            //response
            if(verificationStatus){
this.userAuthService.signupUser({...tempUserData})
                res.status(HTTP_STATUS.ACCEPTED).json({ success: true, message: "OTP verification successfull" })

            }
                : res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "OTP verification failed" });
        } catch (error: unknown) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ success: false, message: error instanceof Error ? error.message : error });
        }
    }
}
