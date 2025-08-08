import express from "express";
import { signupController } from "../controllers/user.controller";
//user router
const userRoute = express.Router();

userRoute.post("/signup", signupController);

export default userRoute;
