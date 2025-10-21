import { Timestamp } from "mongodb";
import { ISkills } from "../models/skills/skill.interface";
import { Role } from "../models/user/user.interface";

export interface UserProfileDTO {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    role: Role;
    provider: string;
    profilePicture?: string;
    resumeURL?: string[];
    about?: string;
    skills?: {
        id: string;
        name: string;
        description?: string;
    }[];
    education?: {
        type: string;
        institution: string;
        fieldOfStudy: string;
        startDate: Date;
        endDate?: Date;
        isCurrent?: boolean;
        grade?: string;
    }[];
    experience?: {
        jobTitle: string;
        company: string;
        startDate: Date;
        endDate?: Date;
        isCurrent?: boolean;
        description?: string;
    }[];
    location?: string;
    address?: {
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    jobsApplied?: string[];
    createdAt: Date;
    updatedAt: Date;
}
