import express from "express";
import companyProfileRoutes from "./company.profile.routes";
import companyJobRoutes from "./company.jobs.routes";

export const companyRoutes = express.Router();

companyRoutes.use("/me", companyProfileRoutes);
companyRoutes.use("/jobs", companyJobRoutes);


export default companyRoutes


