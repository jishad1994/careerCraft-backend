import express from "express";
import { OTPlimiter } from "../utils/auth.utils";
import { authController } from "../dependencies/container.dependency";
export const userAuthRoute = express.Router();

userAuthRoute.post("/signup", authController.signup.bind(authController));

userAuthRoute.post("/login", authController.login.bind(authController)); 

// userAuthRoute.post("/logout", authController.logout.bind(authController)); 

userAuthRoute.post("/googleLogin", authController.google.bind(authController));

userAuthRoute.post("/check-availability", authController.checkUserPhoneOrEmailExists.bind(authController));

userAuthRoute.post("/otp/request", OTPlimiter, authController.requestOTP.bind(authController));

userAuthRoute.post("/otp/resend", OTPlimiter, authController.resendOTP.bind(authController));

userAuthRoute.post("/otp/verify", OTPlimiter, authController.verifyOTP.bind(authController));

userAuthRoute.post("/forgotPassword", OTPlimiter, authController.forgotPassword.bind(authController));

userAuthRoute.post("/resetPassword", OTPlimiter, authController.resetPassword.bind(authController));




export default userAuthRoute;
