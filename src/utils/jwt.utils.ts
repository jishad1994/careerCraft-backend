import jwt from "jsonwebtoken";

import { Role } from "../models/user/user.interface";
import { randomUUID } from "crypto";
import logger from "./logger";
import { AppError } from "../errors/app.error.";

export type AccessPayload = { sub: string; role: Role };
export type RefreshPayload = { jti: string; sub: string; role: Role };

const { JsonWebTokenError, TokenExpiredError } = jwt;

export const createAccessToken = (sub: string, role: Role) => {
    logger.info("accesssecret", process.env.ACCESS_SECRET);
    return jwt.sign({ sub, role } as AccessPayload, process.env.ACCESS_SECRET!, { expiresIn: "15m" });
};

export const verifyAccessToken = (token: string) => {
    try {
        return jwt.verify(token, process.env.ACCESS_SECRET!) as AccessPayload;
    } catch (error: unknown) {
        if (error instanceof TokenExpiredError) {
            throw new AppError("Your session has expired. Please login again.", 401, true);
        }

        if (error instanceof JsonWebTokenError) {
            throw new AppError("Invalid token signature.", 401, true);
        }

        throw new AppError("Authentication failed", 401, true);
    }
};

export const createRefreshToken = (sub: string, role: Role) => {
    const jti = randomUUID();
    logger.info("uuid", jti, "refreshscret", process.env.REFRESH_SECRET!);
    const token = jwt.sign({ jti, sub, role } as RefreshPayload, process.env.REFRESH_SECRET!, { expiresIn: "7d" });
    return { token, jti };
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, process.env.REFRESH_SECRET!) as RefreshPayload;
};
