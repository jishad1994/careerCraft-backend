import { CompanyProfileDTO } from "../dtos/companyProfile.dto";
import { AddressDTO } from "../dtos/userProfile.dto";
import { ICompany, ICompanyListItem, IRejectionReason } from "../models/company/company.interface";
import { IDocument } from "../models/user/user.interface";

// export function toCompanyProfileDTO(company: ICompanyPopulated): CompanyProfileDTO {
//     return {
//         id: company._id.toString(),
//         name: company.name,
//         email: company.email,
//         role: company.role,
//         phone: company.phone,
//         profilePicture: company.profilePicture,
//         isBlocked: company.isBlocked,
//         verificationStatus: company.verificationStatus,
//         rejectionReasons: company.rejectionReasons,
//         website: company.website,
//         location: company.location,
//         GSTIN: company.GSTIN,
//         industry: company.industry,
//         address: company.address?.map((address) => ({
//             city: address.city,
//             state: address.state,
//             country: address.country,
//             postalCode: address.postalCode,
//         })),
//         logo: company.logo,
//         profileCompletion: company.profileCompletion,
//         documents: company.documents,
//         bannerImage: company.bannerImage,
//         description: company.description,
//         createdAt: company.createdAt.toISOString(),
//         updatedAt: company.updatedAt.toISOString(),
//     };
// }

export class CompanyMapper {
    static toCompanyProfileDTO(company: ICompany): CompanyProfileDTO {
        return {
            id: company._id.toString(),
            name: company.name,
            email: company.email,
            role: company.role,
            phone: company.phone,
            profilePicture: company.profilePicture,
            isBlocked: company.isBlocked,
            verificationStatus: company.verificationStatus,
            rejectionReasons: company.rejectionReasons?.map((reason: IRejectionReason) => ({
                code: reason.code,
                description: reason?.description,
                rejectedAt: reason.rejectedAt.toISOString(),
            })),
            website: company.website,
            location: company.location,
            GSTIN: company.GSTIN,
            industry: company.industry,
            address: company.address?.map((addr: AddressDTO) => ({
                city: addr.city,
                state: addr.state,
                country: addr.country,
                postalCode: addr.postalCode,
            })),
            documents: company.documents?.map((doc: IDocument) => ({
                originalName: doc.originalName,
                key: doc.key,
                size: doc.size,
                mimeType: doc.mimeType,
                signedURL: doc.signedURL,
                uploadedAt: doc.uploadedAt,
            })),
            logo: company.logo,
            profileCompletion: company.profileCompletion ?? 0,
            bannerImage: company.bannerImage,
            description: company.description,
            createdAt: company.createdAt.toISOString(),
            updatedAt: company.updatedAt.toISOString(),
        };
    }

    static mapCompanyToListItem(company: ICompany): ICompanyListItem {
        return {
            _id: company._id.toString(),

            name: company.name,
            email: company.email,
            phone: company.phone,

            provider: company.provider,
            role: "company",

            isBlocked: company.isBlocked,

            verificationStatus: company.verificationStatus,

            industry: company.industry,
            location: company.location,

            profilePicture: company.profilePicture
                ? {
                      key: company.profilePicture.key,
                      location: company.profilePicture.location,
                  }
                : undefined,

            bannerImage: company.bannerImage
                ? {
                      key: company.bannerImage.key,
                      location: company.bannerImage.location,
                  }
                : undefined,

            subscriptionStatus: company.activeSubscriptionId
                ? "active" 
                : "pending",

            createdAt: company.createdAt.toISOString(),
            updatedAt: company.updatedAt.toISOString(),
        };
    }

    static mapCompaniesToList(companies: ICompany[]): ICompanyListItem[] {
        return companies.map(this.mapCompanyToListItem);
    }
}
