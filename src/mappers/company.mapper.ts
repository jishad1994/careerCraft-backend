import { CompanyProfileDTO } from "../dtos/companyProfile.dto";
import { ICompanyPopulated } from "../models/company/company.interface";

export function toCompanyProfileDTO(company: ICompanyPopulated): CompanyProfileDTO {
    return {
        id: company._id.toString(),
        name: company.name,
        email: company.email,
        role: company.role,
        phone: company.phone,
        profilePicture: company.profilePicture,
        isBlocked: company.isBlocked,
        isVerified: company.isVerified,
        website: company.website,
        location: company.location,
        GSTIN: company.GSTIN,
        industry: company.industry,
        address: company.address?.map((address) => ({
            city: address.city,
            state: address.state,
            country: address.country,
            postalCode: address.postalCode,
        })),
        logo: company.logo,
        profileCompletion: company.profileCompletion,
        documents: company.documents,
        bannerImage: company.bannerImage,
        description: company.description,
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.createdAt.toISOString(),
    };
}
