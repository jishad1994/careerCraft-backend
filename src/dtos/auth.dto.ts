import { IProfilePicture, Role } from "../models/user/user.interface";

export interface AuthUserResponseDTO {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: "user" | "company" | "admin";
    profilePicture?: IProfilePicture;
}

export interface GoogleAuthRequestDTO {
    credential: string; //googleId token from the front end
    role: Role;
}

export interface LoginResponseDTO {
    accessToken: string;
    refreshToken?: string;
    user: AuthUserResponseDTO;
}
