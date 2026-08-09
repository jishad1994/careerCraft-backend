import { CompanyRejectionCodes, CompanyVerificationStatus, } from "../models/company/company.interface";
import { IBannerImage, IDocument, IProfilePicture } from "../models/user/user.interface";
import { AddressDTO } from "./userProfile.dto";

export interface RejectionReasonDTO {
    code: CompanyRejectionCodes;
    description?: string;
    rejectedAt: string;
}
export class CompanyProfileDTO {
    id!: string;
    name!: string;
    email!: string;
    role: string = "company";
    phone?: string;
    profilePicture?: IProfilePicture;
    isBlocked!: boolean;
    verificationStatus!: CompanyVerificationStatus;
    rejectionReasons?:RejectionReasonDTO[];
    website?: string;
    GSTIN?: string;
    location?: string;
    industry?: string;
    profileCompletion!: number;
    address?: AddressDTO[];
    documents!: IDocument[];
    logo?: string;
    bannerImage?: IBannerImage;
    description?: string;
    createdAt!: string;
    updatedAt!: string;
}
