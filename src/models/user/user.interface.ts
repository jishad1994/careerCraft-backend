import { Document, ObjectId } from "mongoose";

export type Role = "user" | "admin" | "company";
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
    description: string;
}

export interface IUser extends Document {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    googleId: string;
    provider: string;
    role: Role;
    profilePicture?: string;
    isBlocked: boolean;
    address: IAddress;
    resumeURL: string[];
    about: string;
    skills: ObjectId[];
    education: IEducation[];
    experience: IExperience[];
    location: string;
    jobsApplied: ObjectId[]; //_ids of jobs
}
