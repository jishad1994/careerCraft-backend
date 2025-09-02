import express from "express";
import { OTPlimiter } from "../utils/auth.utils";
import { authController } from "../dependencies/container.dependency";
export const userAuthRoute = express.Router();

userAuthRoute.post("/signup", authController.signup.bind(authController));
userAuthRoute.post("/check-phoneOrEmailExists", authController.checkUserPhoneOrEmailExists.bind(authController));
userAuthRoute.post("/request-OTP", OTPlimiter, authController.requestOTP.bind(authController));
userAuthRoute.post("/resend-OTP", OTPlimiter, authController.resendOTP.bind(authController));
userAuthRoute.post("/verify-OTP", OTPlimiter, authController.verifyOTP.bind(authController));

export default userAuthRoute;
