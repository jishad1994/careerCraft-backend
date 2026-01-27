import mongoose, { Document, ObjectId, Types } from "mongoose";
import { ISkill } from "../skill/skill.interface";
import { IPublicFileAsset } from "../company/company.interface";

export type Role = "user" | "admin" | "company";
export type Provider = "local" | "google";
export type JobAppliedStatus = "success" | "pending" | "processing" | "rejected";
//ecuation enum

export enum EducationType {
    Degree = "Degree",
    Diploma = "Diploma",
    HighSchool = "High School",
    PhD = "PhD",
    Certification = "Certification",
}

//education
export interface IEducation {
    type: EducationType;
    institution: string;
    fieldOfStudy: string;
    startDate: Date;
    endDate?: Date;
    isCurrent?: boolean;
    grade?: string;
}

export interface IProfilePicture {
    key: string;
    location: string;
}
export interface IBannerImage {
    key: string;
    location: string;
}

export interface IDocument {
    originalName: string;
    key: string;
    size: number;
    mimeType: string;
    signedURL?: string;
    uploadedAt: Date;
}

//address

export interface IAddress {
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

//experience

export interface IExperience {
    jobTitle: string;
    company: string;
    startDate: Date;
    endDate?: Date;
    isCurrent?: boolean;
    description?: string;
}

export interface IUser extends Document <mongoose.Types.ObjectId>{
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    googleId: string;
    provider: Provider;
    role: Role;
    profilePicture?: IProfilePicture;
    isBlocked: boolean;
    address: IAddress;
    about: string;
    skills: Types.ObjectId[];
    resumeURL: IDocument[];
    certificates: IDocument[];
    education: IEducation[];
    experience: IExperience[];
    location: string;
    jobsApplied: Types.ObjectId[]; //_ids of jobs
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserPopulated {
    _id: ObjectId;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password?: string;
    googleId?: string;
    provider: Provider;
    role: Role;
    profilePicture?: IProfilePicture;
    isBlocked: boolean;
    address?: IAddress;
    resumeURL: IDocument[];
    certificates: IDocument[];
    about: string;
    profileCompletion: number;
    skills: ISkill[];
    education: IEducation[];
    experience: IExperience[];
    location: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserListItem {
    _id: string;

    firstName: string;
    lastName: string;
    email: string;
    phone?: string;

    provider: "local" | "google";
    role: "user" | "company";

    isBlocked: boolean;

    profilePicture?: IPublicFileAsset;

    location?: string;

    createdAt: string; // ISO string
    updatedAt: string;
}
