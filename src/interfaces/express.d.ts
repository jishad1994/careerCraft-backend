import "express";
import { Role } from "../models/user/user.interface";

declare module "express-serve-static-core" {
    interface Request {
        user?: { id: string; role: Role };
    }
}
