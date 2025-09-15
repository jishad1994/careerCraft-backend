import "express";
import { AccessPayload } from "../utils/jwt.utils";

declare module "express-serve-static-core" {
    interface Request {
        user?: AccessPayload;
    }
}
