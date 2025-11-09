import express from "express";
import { OTPlimiter } from "../utils/auth.utils";
import { authController } from "../dependencies/container.dependency";

export const companyAuthRoute = express.Router();
companyAuthRoute.post("/signup", authController.signup.bind(authController));

companyAuthRoute.post("/login", authController.login.bind(authController));

// companyAuthRoute.post("/logout", authController.logout.bind(authController));

companyAuthRoute.post("/googleLogin", authController.google.bind(authController));

companyAuthRoute.post("/check-phoneOrEmailExists", authController.checkUserPhoneOrEmailExists.bind(authController));

companyAuthRoute.post("/otp/request", OTPlimiter, authController.requestOTP.bind(authController));

companyAuthRoute.post("/otp/resend", OTPlimiter, authController.resendOTP.bind(authController));

companyAuthRoute.post("/otp/verify", OTPlimiter, authController.verifyOTP.bind(authController));

companyAuthRoute.post("/forgotPassword", authController.forgotPassword.bind(authController));

companyAuthRoute.post("/resetPassword", authController.resetPassword.bind(authController));

export default companyAuthRoute;
