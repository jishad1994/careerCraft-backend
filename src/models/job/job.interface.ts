import mongoose from "mongoose";

import { Document } from "mongoose";
import { ISkill } from "../skill/skill.interface";

export type EmploymentType = "full-time" | "part-time" | "contract" | "internship" | "freelance";

export type WorkMode = "onsite" | "remote" | "hybrid";

export type JobStatus = "draft" | "active" | "paused" | "closed" | "expired";

export interface IJob extends Document<mongoose.Types.ObjectId> {
    title: string;

    slug: string;

    // recruiter: mongoose.Types.ObjectId;
    
    company: mongoose.Types.ObjectId;

    description: string;
    responsibilities?: string[];
    requirements?: string[];

    employmentType: EmploymentType;
    workMode: WorkMode;

    experience: {
        min: number;
        max: number;
    };

    salary: {
        min?: number;
        max?: number;
        currency: string;
        period: "monthly" | "yearly";
        isHidden: boolean;
    };

    location: {
        country: string;
        state?: string;
        city?: string;
    };

    skills: mongoose.Types.ObjectId[];

    openings: number;

    status: JobStatus;

    isVerified: boolean;
    isFeatured: boolean;

    applicationsCount: number;
    viewsCount: number;

    expiresAt: Date;

    createdAt: Date;
    updatedAt: Date;
}

export interface IJobListItem {
    _id: string;

    title: string;
    slug: string;

    company: {
        _id: mongoose.Types.ObjectId;
        name: string;
        logo?: string;
        location?: {
            country: string;
            city?: string;
        };
    };

    employmentType: EmploymentType;

    workMode: WorkMode;

    experience: {
        min: number;
        max?: number;
    };

    salary?: {
        min?: number;
        max?: number;
        currency: string;
        period: "monthly" | "yearly";
        isHidden: boolean;
    };

    location: {
        country: string;
        state?: string;
        city?: string;
    };

    skills?: string[];

    openings: number;

    status: JobStatus;

    isFeatured: boolean;

    applicationsCount: number;
    viewsCount: number;

    createdAt: Date;
    expiresAt: Date;
}

export interface IJobPopulated {
    _id: string;

    title: string;
    slug: string;

    company: {
        _id: mongoose.Types.ObjectId;
        name: string;
        logo?: string;
        location?: {
            country: string;
            city?: string;
        };
    };

    employmentType: EmploymentType;
    workMode: WorkMode;

    experience: {
        min: number;
        max?: number;
    };

    salary?: {
        min?: number;
        max?: number;
        currency: string;
        period: "monthly" | "yearly";
        isHidden: boolean;
    };

    location: {
        country: string;
        state?: string;
        city?: string;
    };

    skills?: ISkill[];

    openings: number;

    status: JobStatus;

    isFeatured: boolean;

    applicationsCount: number;
    viewsCount: number;

    createdAt: Date;
    expiresAt: Date;
}
