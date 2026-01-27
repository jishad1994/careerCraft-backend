import mongoose, { Document, ObjectId } from "mongoose";
import { IBannerImage, IDocument, IProfilePicture, Role } from "../user/user.interface";
import { AddressDTO } from "../../dtos/userProfile.dto";

export interface IPublicFileAsset {
    key: string;
    location: string;
}

export interface ICompany extends Document<mongoose.Types.ObjectId> {
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

    activeSubscriptionId: ObjectId;

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
    profileCompletion: number;
    logo?: string;
    bannerImage?: IBannerImage;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICompanyListItem {
    _id: string;

    name: string;
    email: string;
    phone?: string;

    provider: "local" | "google";
    role: "company";

    isBlocked: boolean;
    isVerified: boolean;

    industry?: string;
    location?: string;

    profilePicture?: IPublicFileAsset;
    bannerImage?: IPublicFileAsset;

    subscriptionStatus: "active" | "expired" | "pending";

    createdAt: string;
    updatedAt: string;
}
