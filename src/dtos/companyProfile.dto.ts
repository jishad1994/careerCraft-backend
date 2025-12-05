import { AddressDTO } from "./userProfile.dto";

export class CompanyProfileDTO {
    id!: string;
    name!: string;
    email!: string;
    role: string = "company";
    phone?: string;
    profilePicture?: string;
    isBlocked!: boolean;
    isVerified!: boolean;
    website?: string;
    location?: string;
    industry?: string;
    address?: AddressDTO[];
    logo?: string;
    bannerImage?: string;
    description?: string;
    createdAt!: string;
}
