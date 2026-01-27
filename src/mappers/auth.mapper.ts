import { AuthUserResponseDTO } from "../dtos/auth.dto";
import { ICompany } from "../models/company/company.interface";
import { IUser, Role } from "../models/user/user.interface";

export class AuthMapper {
    static toAuthUserDto(user: IUser | ICompany): AuthUserResponseDTO {
        return {
            id: String(user._id),
            name: "name" in user ? user.name : undefined,
            firstName: "firstName" in user ? user.firstName : undefined,
            lastName: "lastName" in user ? user.lastName : undefined,
            email: user.email,
            role: user.role as Role,
            profilePicture: user.profilePicture ? user.profilePicture : undefined,
        };
    }
   
}
