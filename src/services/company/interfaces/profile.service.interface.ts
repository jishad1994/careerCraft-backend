import { CompanyProfileDTO } from "../../../dtos/companyProfile.dto";

export interface ICompanyProfileService{

getCompanyProfile(companyId:string):Promise<CompanyProfileDTO >


}