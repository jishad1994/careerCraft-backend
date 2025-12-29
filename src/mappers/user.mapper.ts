import { UserProfileDTO } from "../dtos/userProfile.dto";
import { IUserPopulated } from "../models/user/user.interface";

export function toUserProfileDTO(user: IUserPopulated): UserProfileDTO {
    return {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName || "",
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        profilePicture: user.profilePicture,
        about: user.about,  
        provider: user.provider,
        isBlocked: user.isBlocked,
        location: user.location,
        address: user.address,
        resumeURL: user.resumeURL,
        certificates:user.certificates,
        skills: user.skills?.map((skill) => ({ id: skill._id.toString(), name: skill.name })),

        education: user.education?.map((edu) => ({
            type: edu.type,
            institution: edu.institution,
            fieldOfStudy: edu.fieldOfStudy,
            startDate: edu.startDate.toISOString(),
            endDate: edu.endDate?.toISOString(),
            isCurrent: edu.isCurrent,
            grade: edu.grade,
        })),

        experience: user.experience?.map((exp) => ({
            jobTitle: exp.jobTitle,
            company: exp.company,
            startDate: exp.startDate.toISOString(),
            endDate: exp.endDate?.toISOString(),
            isCurrent: exp.isCurrent,
            description: exp.description,
        })),

        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
}
