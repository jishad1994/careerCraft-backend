import { IProfilePicture, Role } from "../models/user/user.interface";

export interface AuthUserResponseDTO {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: Role;
    profilePicture?: IProfilePicture;
}
