import express from "express";
import { OTPlimiter } from "../utils/auth.utils";

import { userAuthController } from "../dependencies/container.dependency";
import { UserAuthController } from "../controllers/user.auth.controller";
export const userAuthRoute = express.Router();

userAuthRoute.post("/signup", userAuthController.userSignupController.bind(userAuthController));
userAuthRoute.get("/check-phone/:phone", userAuthController.checkUserPhoneExists.bind(userAuthController));
userAuthRoute.get("/check-email/:email", userAuthController.checkUserEmailTaken.bind(userAuthController));
userAuthRoute.post("/request-OTP", OTPlimiter, userAuthController.requestOTP.bind(userAuthController));
userAuthRoute.post("/verify-OTP", OTPlimiter, userAuthController.verifyOTP.bind(userAuthController));

export default userAuthRoute;
