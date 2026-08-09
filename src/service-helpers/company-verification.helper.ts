import { ICompany } from "../models/company/company.interface";

export interface ICompanyVerificationResult {
    isEligible: boolean;
    completionPercentage: number;
    missingFields: {
        key: string;
        label: string;
    }[];
}


export interface ICompanyVerificationRule {
    key: string;
    label: string;
    weight: number;  
    validate: (company: ICompany) => boolean;
}

const COMPANY_VERIFICATION_RULES: ICompanyVerificationRule[] = [
    { key: "website", label: "Website", weight: 10, validate: c => !!c.website },
    { key: "location", label: "Location", weight: 10, validate: c => !!c.location },
    { key: "industry", label: "Industry", weight: 10, validate: c => !!c.industry },
    { key: "description", label: "Description", weight: 10, validate: c => !!c.description },
    { key: "logo", label: "Company Logo", weight: 10, validate: c => !!c.logo },
    { key: "phone", label: "Phone", weight: 10, validate: c => !!c.logo },
    {
        key: "numberOfEmployees",
        label: "Number of Employees",
        weight: 10,
        validate: c => !!c.numberOfEmployees && c.numberOfEmployees > 0,
    },
    {
        key: "address",
        label: "Address",
        weight: 15,
        validate: c => !!c.address && c.address.length > 0,
    },
    {
        key: "documents",
        label: "Verification Documents",
        weight: 15,
        validate: c => !!c.documents && c.documents.length > 0,
    },
];

export class CompanyVerificationHelper {
    static evaluate(company: ICompany): ICompanyVerificationResult {
        let earnedWeight = 0;
        const missingFields: { key: string; label: string }[] = [];

        for (const rule of COMPANY_VERIFICATION_RULES) {
            if (rule.validate(company)) {
                earnedWeight += rule.weight;
            } else {
                missingFields.push({
                    key: rule.key,
                    label: rule.label,
                });
            }
        }

        return {
            isEligible: missingFields.length === 0,
            completionPercentage: Math.min(earnedWeight, 100),
            missingFields,
        };
    }
}
