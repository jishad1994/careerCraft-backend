import rateLimiter from "express-rate-limit";

export function omit<T extends object, K extends keyof T>(obj: T, key: K): Omit<T, K> {

    const { [key]: _, ...rest } = obj;
    return rest;
}

export type userSignupData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: string;
};

export type companySignupData = {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
};

export type cachedUserOrCompanyData = {
    name?: string;
    firstName?: string;
    lastName?: string;
    phone: string;
    role: string;
    email: string;
    password: string;
    otpHashed: string;
    otpVerified: boolean;
};

export type loginData = {
    email: string;
    passwod: string;
};

export const OTPlimiter = rateLimiter({
    windowMs: 60 * 1000, //one minute
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: "Too many requests, please try again later.",
    },
});

export function resetPasswordLink(role: string, resetPasswordToken: string): string {
    return `http://localhost:4200/auth/resetPassword?token=${resetPasswordToken}&role=${role}`;
}
