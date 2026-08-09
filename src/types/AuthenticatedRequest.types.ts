import { Request } from "express";
import { Role } from "../models/user/user.interface";

export interface AuthenticatedRequest extends Request {
    user: { id: string; role: Role };
}
