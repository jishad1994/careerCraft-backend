import { AuthUserResponseDTO } from "../dtos/auth.dto";
import { UserProfileDTO, UserSkillDTO } from "../dtos/userProfile.dto";
import { ICompany } from "../models/company/company.interface";
import { IUser } from "../models/user/user.interface";
import { ISkills } from "../models/skills/skill.interface";

export function toAuthUserResponseDTO(entity: IUser | ICompany): AuthUserResponseDTO {
    return entity.role == "user"
        ? {
              id: String(entity._id),
              email: String(entity.email),
              role: entity.role || "user",
              firstName: (entity as IUser).firstName,
              lastName: (entity as IUser).lastName,
          }
        : {
              id: String(entity._id),
              email: String(entity.email),
              role: entity.role || "company",
              name: (entity as ICompany).name,
          };
}

export function toUserProfileDTO(user: IUser): UserProfileDTO {
    return {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        about: user.about,
        location: user.location,
        address: user.address
            ? {
                  city: user.address.city,
                  state: user.address.state,
                  country: user.address.country,
                  postalCode: user.address.postalCode,
              }
            : undefined,
        skills: Array.isArray(user.skills)
            ? user.skills.map((s) => ({
                  id: s._id?.toString?.() ?? s.toString(),
                  name: s.name ?? "",
              }))
            : [],
        education:
            user.education?.map((e) => ({
                type: e.type,
                institution: e.institution,
                fieldOfStudy: e.fieldOfStudy,
                startDate: e.startDate,
                endDate: e.endDate,
                isCurrent: e.isCurrent,
                grade: e.grade,
            })) || [],
        experience:
            user.experience?.map((ex) => ({
                jobTitle: ex.jobTitle,
                company: ex.company,
                startDate: ex.startDate,
                endDate: ex.endDate,
                isCurrent: ex.isCurrent,
                description: ex.description,
            })) || [],
        // jobsApplied: user.jobsApplied?.map((j) => j.toString()) || [],
        resumeURL: user.resumeURL || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
