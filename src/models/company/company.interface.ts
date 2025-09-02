import { Document, ObjectId } from "mongoose";
import { Role } from "../user/user.interface";

export interface ICompany extends Document {
    name: string;

    email: string;

    phone: string;

    website: string;

    password: string;

    role: Role;

    isBlocked: boolean;

    isVerified: boolean;

    industry: string;

    location: string;

    GSTIN: string;

    address: string[];

    logo: string;

    bannerImage: string;

    description: string;

    subscriptionPackage: ObjectId;

    subscriptionStatus: string;

    subscriptionStart: Date;

    subscriptionEnd: Date;

    numberOfEmployees: number;

    staffs: ObjectId[];

    documents: string[];

    jobsPosted: ObjectId[];
}
