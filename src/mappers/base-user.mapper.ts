import { AuthUserResponseDTO } from "../dtos/auth.dto";
import { ICompany } from "../models/company/company.interface";
import { IUser } from "../models/user/user.interface";

export function toAuthUserResponseDTO(entity: IUser | ICompany): AuthUserResponseDTO {
    return entity.role == "user"
        ? {
              id: String(entity._id),
              email: String(entity.email),
              role: entity.role || "user",
              firstName: (entity as IUser).firstName,
              lastName: (entity as IUser).lastName,
              profilePicture: (entity as IUser).profilePicture,
          }
        : {
              id: String(entity._id),
              name: (entity as ICompany).name,
              email: String(entity.email),
              role: entity.role || "company",
              profilePicture: (entity as ICompany).profilePicture,
          };
}
