import express from "express";
import { OTPlimiter } from "../utils/auth.utils";
import { authController } from "../dependencies/container.dependency";

export const companyAuthRoute = express.Router();
companyAuthRoute.post("/signup", authController.signup.bind(authController));
companyAuthRoute.post("/check-phoneOrEmailExists", authController.checkUserPhoneOrEmailExists.bind(authController));
companyAuthRoute.post("/request-OTP", OTPlimiter, authController.requestOTP.bind(authController));
companyAuthRoute.post("/resend-OTP", OTPlimiter, authController.resendOTP.bind(authController));
companyAuthRoute.post("/verify-OTP", OTPlimiter, authController.verifyOTP.bind(authController));

export default companyAuthRoute;
