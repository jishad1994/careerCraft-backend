import { CookieOptions } from "express";

export const refreshTokenCookieName = "refreshToken";

export const refreshTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", //only true in production
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
};

export const accessTokenCookieName = "accessToken";

export const accessTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", //only true in production
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60 * 1000, //15 minutes
};
