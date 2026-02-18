import mongoose, { Document, ObjectId } from "mongoose";
import { IBannerImage, IDocument, IProfilePicture, Role } from "../user/user.interface";
import { AddressDTO } from "../../dtos/userProfile.dto";

export const COMPANY_REJECTION_CODES = {
    INVALID_DOCUMENT: "INVALID_DOCUMENT",
    MISMATCHED_GST: "MISMATCHED_GST",
    INCOMPLETE_PROFILE: "INCOMPLETE_PROFILE",
    DUPLICATE_COMPANY: "DUPLICATE_COMPANY",
    OTHER: "OTHER",
} as const;

export type CompanyRejectionCodes = (typeof COMPANY_REJECTION_CODES)[keyof typeof COMPANY_REJECTION_CODES];

export const COMPANY_VERIFICATION_STATUS = {
    PENDING: "pending",
    APPROVED: "verified",
    REJECTED: "rejected",
} as const;

export type CompanyVerificationStatus = (typeof COMPANY_VERIFICATION_STATUS)[keyof typeof COMPANY_VERIFICATION_STATUS];

export interface IPublicFileAsset {
    key: string;
    location: string;
}

export interface IRejectionReason {
    code: CompanyRejectionCodes;
    description?: string;
    rejectedAt: Date;
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

    verificationStatus: CompanyVerificationStatus;

    rejectionReasons: IRejectionReason[];

    industry: string;

    location?: string;

    GSTIN?: string;

    address?: AddressDTO[];

    logo?: string;

    bannerImage?: IBannerImage;

    profileCompletion: number;

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
    verificationStatus: CompanyVerificationStatus;
    rejectionReasons?: IRejectionReason[];
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

    verificationStatus: CompanyVerificationStatus;
    industry?: string;
    location?: string;

    profilePicture?: IPublicFileAsset;
    bannerImage?: IPublicFileAsset;

    subscriptionStatus: "active" | "expired" | "pending";

    createdAt: string;
    updatedAt: string;
}
