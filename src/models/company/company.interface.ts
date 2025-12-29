import { Document, ObjectId } from "mongoose";
import { IBannerImage, IDocument, IProfilePicture, Role } from "../user/user.interface";
import { AddressDTO } from "../../dtos/userProfile.dto";

export interface ICompany extends Document {
    _id: ObjectId;
    name: string;

    email: string;

    phone?: string;

    website?: string;

    password?: string;

    googleId?: string;

    provider: "google" | "local";
    role: Role;

    profilePicture?: IProfilePicture;

    isBlocked: boolean;

    isVerified: boolean;

    industry?: string;

    location?: string;

    GSTIN?: string;

    address?: AddressDTO[];

    logo?: string;

    bannerImage?: IBannerImage;

    description?: string;

    subscriptionPackage?: ObjectId;

    subscriptionStatus?: "active" | "expired" | "pending";

    subscriptionStart?: Date;

    subscriptionEnd?: Date;

    numberOfEmployees?: number;

    staffs?: ObjectId[];

    documents: IDocument[];

    jobsPosted?: ObjectId[];

    createdAt: Date;

    updatedAt: Date;
}

export interface ICompanyPopulated {
    _id: ObjectId;
    name: string;
    email: string;
    role: Role;
    phone?: string;
    profilePicture?: IProfilePicture;
    isBlocked: boolean;
    isVerified: boolean;
    website?: string;
    documents: IDocument[];
    location?: string;
    industry?: string;
    GSTIN?: string;
    address?: AddressDTO[];
    logo?: string;
    bannerImage?: IBannerImage;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
