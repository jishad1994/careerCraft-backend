import { CompanyProfileDTO } from "../../../dtos/companyProfile.dto";
import { AppError } from "../../../errors/app.error.";
import { toCompanyProfileDTO } from "../../../mappers/company.mapper";
import { ICompanyRepository } from "../../../repositories/company/company.repository.interface";
import { ICompanyProfileService } from "../interfaces/profile.service.interface";

export class CompanyProfileService implements ICompanyProfileService {
    constructor(private _companyRepository: ICompanyRepository) {}

    async getCompanyProfile(companyId: string): Promise<CompanyProfileDTO> {
        const company = await this._companyRepository.findById(companyId)

        if (!company) throw new AppError("Company not found");
        if (company.isBlocked) throw new AppError("Company not found");
        return toCompanyProfileDTO(company);
    }
}
