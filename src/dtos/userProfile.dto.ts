import { EducationType, IBannerImage, IDocument, IProfilePicture, Role } from "../models/user/user.interface";

export class EducationDTO {
    type!: EducationType;
    institution!: string;
    fieldOfStudy!: string;
    startDate!: string;
    endDate?: string;
    isCurrent?: boolean;
    grade?: string;
}

export class SkillDTO {
    id!: string;
    name!: string;
    description?: string;
}

export class ExperienceDTO {
    jobTitle!: string;
    company!: string;
    startDate!: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
}

export class AddressDTO {
    city!: string;
    state!: string;
    country!: string;
    postalCode!: string;
}

export class JobsAppliedDTO {
    id!: string;
    jobName!: string;
    companyName!: string;
}

export class UserProfileDTO {
    id!: string;
    firstName!: string;
    lastName?: string;
    email!: string;
    phone?: string;
    role!: Role;
    profilePicture?: IProfilePicture;
    bannerImage?: IBannerImage;
    about?: string;
    isBlocked!: boolean;

    provider!: "local" | "google";
    location?: string;

    skills?: SkillDTO[];
    education?: EducationDTO[];
    experience?: ExperienceDTO[];
    totalExperienceYears!: number;
    address?: AddressDTO;

    certificates?: IDocument[];
    resumeURL?: IDocument[];
    profileCompletion!: number;

    // jobsApplied?: IJobsApplied[];
    createdAt!: string;
    updatedAt!: string;
}
