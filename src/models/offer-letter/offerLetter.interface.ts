
import { Document, Types } from "mongoose";


export type OfferLetterStatus = "pending" | "accepted" | "rejected" | "verified";


export interface ICompensation {
    baseSalary: number;
    currency: string;
    period: "monthly" | "yearly";
    bonus?: string;
    otherBenefits?: string;
}


export interface IOfferLetter extends Document {
    application: Types.ObjectId;
    job: Types.ObjectId;
    company: Types.ObjectId;
    candidate: Types.ObjectId;

    // Offer details
    offerDate: Date;
    expiresAt: Date;
    designation: string;
    department: string;
    joiningDate: Date;
    workLocation: string;
    workMode: "onsite" | "remote" | "hybrid";
    employmentType: "full-time" | "part-time" | "contract" | "internship";

    // Compensation
    compensation: ICompensation;

    // Probation
    probationPeriod?: number; // in months

    // Additional terms
    additionalTerms?: string;

    // Status flow
    status: OfferLetterStatus;

    // Candidate response
    respondedAt?: Date;
    rejectionReason?: string;

    // Signed document
    signedDocument?: {
        fileKey: string;
        fileName: string;
        uploadedAt: Date;
        signedURL?: string;
    };

    // Company verification
    verifiedAt?: Date;
    verifiedBy?: Types.ObjectId;

    // PDF
    generatedPdfKey?: string;
    generatedPdfSignedURL?: string;

    createdAt: Date;
    updatedAt: Date;
}

// ---- Create offer request ----

export interface ICreateOfferLetterDto {
    applicationId: string;
    designation: string;
    department: string;
    joiningDate: string;
    expiresAt: string;
    workLocation: string;
    workMode: "onsite" | "remote" | "hybrid";
    employmentType: "full-time" | "part-time" | "contract" | "internship";
    compensation: ICompensation;
    probationPeriod?: number;
    additionalTerms?: string;
}

// ---- Populated offer for list/detail views ----

export interface IOfferLetterPopulated {
    _id: string;
    application: {
        _id: string;
        status: string;
    };
    job: {
        _id: string;
        title: string;
        slug: string;
    };
    company: {
        _id: string;
        name: string;
        email: string;
        location?: string;
        profilePicture?: { location: string };
    };
    candidate: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        profilePicture?: { location: string };
    };
    offerDate: Date;
    expiresAt: Date;
    designation: string;
    department: string;
    joiningDate: Date;
    workLocation: string;
    workMode: string;
    employmentType: string;
    compensation: ICompensation;
    probationPeriod?: number;
    additionalTerms?: string;
    status: OfferLetterStatus;
    respondedAt?: Date;
    rejectionReason?: string;
    signedDocument?: {
        fileKey: string;
        fileName: string;
        uploadedAt: Date;
        signedURL?: string;
    };
    verifiedAt?: Date;
    generatedPdfKey?: string;
    generatedPdfSignedURL?: string;
    createdAt: Date;
    updatedAt: Date;
}

// ---- Candidate respond ----

export interface ICandidateRespondDto {
    action: "accept" | "reject";
    rejectionReason?: string;
}