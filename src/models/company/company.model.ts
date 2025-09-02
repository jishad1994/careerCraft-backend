import mongoose, { Model } from "mongoose";
import { companySchema } from "./company.schema";
import { ICompany } from "./company.interface";

export const Company: Model<ICompany> = mongoose.model<ICompany>("Company", companySchema);
