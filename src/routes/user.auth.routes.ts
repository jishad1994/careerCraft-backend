import express from "express";
import { OTPlimiter } from "../utils/auth.utils";
import { authController } from "../dependencies/container.dependency";
export const userAuthRoute = express.Router();

import { validate } from "../middlewares/validator.middleware";
import {
    checkAvailabilitySchema,
    emailAndRoleSchema,
    forgotPasswordSchema,
    googleLoginSchema,
    loginCredentialsSchema,
    requestOtpSchema,
    resendOtpSchema,
    resetPasswordSchema,
    verifyOtpSchema,
} from "../validators-schemas/auth.schemas";

userAuthRoute.post("/signup", validate(emailAndRoleSchema, ["body"]), authController.signup.bind(authController));

userAuthRoute.post("/login", validate(loginCredentialsSchema, ["body"]), authController.login.bind(authController));

userAuthRoute.post("/googleLogin", validate(googleLoginSchema, ["body"]), authController.google.bind(authController));

userAuthRoute.post(
    "/check-availability",
    validate(checkAvailabilitySchema, ["body"]),
    authController.checkUserPhoneOrEmailExists.bind(authController)
);

userAuthRoute.post(
    "/otp/request",
    validate(requestOtpSchema, ["body"]),
    OTPlimiter,
    authController.requestOTP.bind(authController)
);

userAuthRoute.post(
    "/otp/resend",
    validate(resendOtpSchema, ["body"]),
    OTPlimiter,
    authController.resendOTP.bind(authController)
);

userAuthRoute.post(
    "/otp/verify",
    validate(verifyOtpSchema, ["body"]),
    OTPlimiter,
    authController.verifyOTP.bind(authController)
);

userAuthRoute.post(
    "/forgotPassword",
    validate(forgotPasswordSchema, ["body"]),
    OTPlimiter,
    authController.forgotPassword.bind(authController)
);

userAuthRoute.post(
    "/resetPassword",
    validate(resetPasswordSchema, ["body"]),
    OTPlimiter,
    authController.resetPassword.bind(authController)
);

export default userAuthRoute;
