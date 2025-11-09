import express from "express";
import { authController } from "../dependencies/container.dependency";
const commonRoute = express.Router();

commonRoute.get("/refresh", authController.refresh.bind(authController));
commonRoute.post("/logout", authController.logout.bind(authController));

export default commonRoute;
