import { CookieOptions } from "express";

export const refreshCookieName = "refreshToken";

export const refreshCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", //only true in production
    sameSite: "strict",
    path: "api/auth/refresh-token",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
