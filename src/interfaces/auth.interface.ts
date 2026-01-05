import { Role } from "../models/user/user.interface";

//temporary user Data to be saved on cache
export interface ITempUserData {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    otpHashed: string;
}

export interface ITempCompanyData {
    name: string;
    phone: string;
    email: string;
    password: string;
    role: string;
    otpHashed: string;
}

export interface IAuthUser {
    id: string;
    role: Role;
}
