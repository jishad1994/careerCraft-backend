import { CompanyProfileDTO } from "../../../dtos/companyProfile.dto";
import { ICompany } from "../../../models/company/company.interface";

export interface ICompanyProfileService {
    getProfile(companyId: string): Promise<CompanyProfileDTO>;
    updateBasicProfile(companyId: string, profileData: Partial<ICompany>): Promise<CompanyProfileDTO>;
    updateProfilePicture(companyId: string, profilePicture: Express.Multer.File): Promise<CompanyProfileDTO>;
    deleteProfilePicture(companyId: string): Promise<CompanyProfileDTO>;
    updateBannerImage(companyId: string, bannerImage: Express.Multer.File): Promise<CompanyProfileDTO>;
    deleteBannerImage(companyId: string): Promise<CompanyProfileDTO>;
    uploadDocument(companyId: string, document: Express.Multer.File): Promise<CompanyProfileDTO>;
    deleteDocument(companyId: string, documentKey: string): Promise<CompanyProfileDTO>;
}
