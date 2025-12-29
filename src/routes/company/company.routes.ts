import express from "express";
import companyProfileRoutes from "./company.profile.routes";

export const companyRoutes = express.Router();

companyRoutes.use("/me", companyProfileRoutes);


export default companyRoutes