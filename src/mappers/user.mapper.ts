import { AuthUserDTO } from "../dtos/auth.dto";
import { ICompany } from "../models/company/company.interface";
import { IUser } from "../models/user/user.interface";

export function toAuthUserResponseDTO(entity: Partial<IUser> | Partial<ICompany>): AuthUserDTO {
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
