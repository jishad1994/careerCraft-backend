import jwt from "jsonwebtoken";
import { Role } from "../models/user/user.interface";
import { randomUUID } from "crypto";



export type AccessPayload = { sub: string; role: Role };
export type RefreshPayload = { jti: string; sub: string; role: Role };

export const createAccessToken = (sub: string, role: Role) => {
    console.log("accesssecret", process.env.ACCESS_SECRET);
    return jwt.sign({ sub, role } as AccessPayload, process.env.ACCESS_SECRET!, { expiresIn: "15m" });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token,process.env.ACCESS_SECRET!) as AccessPayload;
};

export const createRefreshToken = (sub: string, role: Role) => {
    const jti = randomUUID();
    console.log("uuid", jti, "refreshscret",process.env.REFRESH_SECRET!);
    const token = jwt.sign({ jti, sub, role } as RefreshPayload, process.env.REFRESH_SECRET!, { expiresIn: "7d" });
    return { token, jti };
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, process.env.REFRESH_SECRET!) as RefreshPayload;
};
