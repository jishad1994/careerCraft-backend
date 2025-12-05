import { boolean, z } from "zod";

export const roleEnum = z.enum(["user", "company", "admin"]);

export const passwordSchema = z.string().min(8, "Password must be at least 8 characters long").max(64, "Password too long");
export const emailSchema = z.email().trim();
const phoneSchema = z.string().regex(/^[0-9]{10,15}$/, "Phone must contain 10-15 digits");

export const loginCredentialsValidator = z.object({
    email: emailSchema,
    password: passwordSchema,
    role: roleEnum,
});

export const emailValidator = z.object({
    email: emailSchema,
});

export const authUserResponseValidator = z.object({
    id: z.string(),
    name: z.string().min(2, "name should be atleast 2 characters long").optional(),
    firstName: z.string().min(2, " first name should be atleast 2 characters long").optional(),
    lastName: z.string().min(2, "last name should be atleast 2 characters long").optional(),
    email: emailSchema,
    phone: phoneSchema.optional(),
    role: roleEnum,
    profilePicture: z.string().optional(),
});

export const userSignupValidator = z.object({
    role: z.literal("user"),
    firstName: z.string().min(2, "First name is required").trim(),
    lastName: z.string().min(2, "Last name is required").trim(),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    otpVerified: z.boolean().optional(),
});

export const companySignupValidator = z.object({
    role: z.literal("company"),
    name: z.string().min(2, "Company name is required").trim(),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    otpVerified: z.boolean().optional(),
});
export const GoogleAuthRequestValidator = z.object({
    credential: z.string(),
    role: roleEnum,
});

export const loginResponseValidator = z.object({
    success: boolean,
    message: z.string(),
    user: authUserResponseValidator,
});

export const emailAndRoleValidator = z.object({
    email: z.email().trim(),
    role: roleEnum,
});

export const signupValidator = z.discriminatedUnion("role", [userSignupValidator, companySignupValidator]);

export const cachedUserValidator = signupValidator;

// new schema with an extra field

//types

export type UserSignupDTO = z.infer<typeof userSignupValidator>;

export type CompanySignupDTO = z.infer<typeof companySignupValidator>;

export type SignupRequestDTO = z.infer<typeof signupValidator>;

export type LoginRequestDTO = z.infer<typeof loginCredentialsValidator>;
