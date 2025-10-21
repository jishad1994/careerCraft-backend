import { Role } from "../models/user/user.interface";

export interface AuthResponseUserDTO {
    id: string;
    email: string;
    role: Role;
    firstName?: string;
    lastName?: string;
    name?: string;
}

export interface GoogleAuthRequestDTO {
    credential: string; //googleId token from the front end
    role: Role;
}

export interface LoginResponseDTO {
    accessToken: string;
    refreshToken?: string;
    user: AuthResponseUserDTO;
}
