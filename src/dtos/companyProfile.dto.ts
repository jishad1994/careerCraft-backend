import { IProfilePicture } from "../models/user/user.interface";
import { AddressDTO } from "./userProfile.dto";

export class CompanyProfileDTO {
    id!: string;
    name!: string;
    email!: string;
    role: string = "company";
    phone?: string;
    profilePicture?: IProfilePicture;
    isBlocked!: boolean;
    isVerified!: boolean;
    website?: string;
    GSTIN?: string;
    location?: string;
    industry?: string;
    address?: AddressDTO[];
    logo?: string;
    bannerImage?: string;
    description?: string;
    createdAt!: string;
    updatedAt!: string;
}
