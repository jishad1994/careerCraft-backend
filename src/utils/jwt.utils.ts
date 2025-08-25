import jwt from "jsonwebtoken";
import { Role } from "../models/user/user.interface";
import { randomUUID } from "crypto";

export const ACCESS_SECRET = process.env.ACCESS_SECRET!;
export const REFRESH_SECRET = process.env.REFRESH_SECRET!;

export type AccessPayload = { sub: string; role: Role };
export type RefreshPayload = { jti: string; sub: string; role: Role };

export const createAccessToken = (sub: string, role: Role) => {
    return jwt.sign({ sub, role } as AccessPayload, ACCESS_SECRET, { expiresIn: "15m" });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, ACCESS_SECRET) as AccessPayload;
};

export const createRefreshToken = (sub: string, role: Role) => {
    const jti = randomUUID();
    const token = jwt.sign({ jti, sub, role } as RefreshPayload, REFRESH_SECRET, { expiresIn: "7d" });
    return { token, jti };
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, REFRESH_SECRET) as RefreshPayload;
};
