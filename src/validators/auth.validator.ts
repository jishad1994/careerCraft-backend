import { boolean, success, z } from "zod";

export const roleEnum = z.enum(["user", "company", "admin"]);

export const loginDataValidator = z.object({
    email: z.email(),
    password: z.string().min(8).max(64),
    role: roleEnum,
});

export const emailValidator = z.object({
    email: z.email().trim(),
});

export const passwordValidator = z.object({
    password: z.string().min(8, "Password must be at least 8 characters long").max(64, "Password too long"),
});

export const authUserResponseValidator = z.object({
    id: z.string(),
    name: z.string().min(2, "name should be atleast 2 characters long").optional(),
    firstName: z.string().min(2, " first name should be atleast 2 characters long").optional(),
    lastName: z.string().min(2, "last name should be atleast 2 characters long").optional(),
    email: emailValidator,
    role: roleEnum,
    profilePicture: z.string().optional(),
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
