import mongoose, { Document, ObjectId, Schema } from "mongoose";

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
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    role: "user" | "admin";
    profilePicture: string;
    isBlocked: boolean;
    address: {
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    resumeURL: string;
    about: string;
    skills: ObjectId[];
    education: IEducation[];
    experience: IExperience[];
    location: string;
    jobsApplied: ObjectId[]; //_ids of jobs
}
