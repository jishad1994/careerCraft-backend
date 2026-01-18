import { z } from "zod";
import { idParamSchema } from "./admin.schemas";

const roleSchema = z.enum(["user", "company", "admin"]);

const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const emailSchema = z.email("Invalid Email format").trim().toLowerCase();

const phoneSchema = z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")

    .optional();

// MongoDB ObjectId regex
export const dbIdLength = parseInt(process.env.DB_OBJECT_ID_LENGTH || "24", 10);
export const idRegexString = process.env.DB_OBJECT_ID_REGEX || "^[0-9a-fA-F]{24}$";
export const dbIdRegex = new RegExp(idRegexString);

export const objectIdSchema = z.string().length(dbIdLength, "ID must be exactly 24 characters").regex(dbIdRegex);

//  regex for JWT structure (header.payload.signature)
const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

export const AuthCookiesSchema = z.object({
    accessToken: z.string().regex(jwtRegex, "Invalid token format"),
    refreshToken: z.string().regex(jwtRegex, "Invalid token format"),
});

export const loginCredentialsSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    role: roleSchema,
});

export const authUserSchema = z.object({
    id: objectIdSchema,
    role: roleSchema,
});

export const authUserResponseSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "name should be atleast 2 characters long").optional(),
    firstName: z.string().min(2, " first name should be atleast 2 characters long").optional(),
    lastName: z.string().min(2, "last name should be atleast 2 characters long").optional(),
    email: emailSchema,
    phone: phoneSchema.optional(),
    role: roleSchema,
    profilePicture: z.string().optional(),
});

export const userSignupSchema = z.object({
    role: roleSchema,
    firstName: z.string().min(2, "First name is required").trim(),
    lastName: z.string().min(2, "Last name is required").trim().optional(),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    otpVerified: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
    newPassword: passwordSchema,
    resetPasswordToken: z.string().min(1, "Reset token is required"),
});

export const forgotPasswordSchema = z.object({
    email: emailSchema,
    role: roleSchema,
});

export const companySignupSchema = z.object({
    role: z.literal("company"),
    name: z.string().min(2, "Company name is required").trim(),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    otpVerified: z.boolean().optional(),
});

export const googleLoginSchema = z.object({
    credential: z.string().min(1, "Google Credential is required"),
    role: roleSchema,
});

export const emailAndRoleSchema = z.object({
    email: z.email().trim(),
    role: roleSchema,
});

export const checkAvailabilitySchema = z.object({
    phoneOrEmail: z.string().min(1, "Phone or email is required"),
    role: roleSchema,
});

const otpSchema = z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers");

export const verifyOtpSchema = z.object({
    otp: otpSchema,
    email: emailSchema,
    role: roleSchema,
});

export const requestOtpSchema = z.object({
    email: emailSchema,
    role: roleSchema,
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().optional(),
    phone: phoneSchema,
    password: passwordSchema,
    name: z.string().optional(),
});

export const resendOtpSchema = z.object({
    email: emailSchema,
    role: roleSchema,
});

export const signupValidatorSchema = z.discriminatedUnion("role", [userSignupSchema, companySignupSchema]);

export const cachedUserValidator = z.object({
    email: emailSchema,
    role: roleSchema,
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: phoneSchema,
    password: z.string(),
    name: z.string().optional(),
    otpVerified: z.boolean(),
    otp: z.string().optional(),
    otpExpiry: z.number().optional(),
});

// Type exports

export type LoginRequestDTO = z.infer<typeof loginCredentialsSchema>;
export type SignupRequestDTO = z.infer<typeof signupValidatorSchema>;
export type EmailAndRoleDTO = z.infer<typeof emailAndRoleSchema>;
export type CheckAvailabilityDTO = z.infer<typeof checkAvailabilitySchema>;
export type RequestOtpDTO = z.infer<typeof requestOtpSchema>;
export type ResendOtpDTO = z.infer<typeof resendOtpSchema>;
export type VerifyOtpDTO = z.infer<typeof verifyOtpSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type GoogleLoginDTO = z.infer<typeof googleLoginSchema>;
export type CachedUserData = z.infer<typeof cachedUserValidator>;
export type AuthCookiesDTO = z.infer<typeof AuthCookiesSchema>;

export type IdParam = z.infer<typeof idParamSchema>;
