import { z } from "zod";

export const CreateUser = z.object({
    name: z.string().max(255),
    age: z.number().gt(0).optional(),
    email: z.email().max(255),
    password: z.string().optional(),
    '2fa_enabled': z.boolean().optional().default(false),
    googleId: z.string().optional()
});

export type CreateUser = z.infer<typeof CreateUser>;

export const AuthenticateUser = z.object({
    email: z.email("Invalid e-mail provided."),
    password: z.string()
});

export type AuthenticateUser = z.infer<typeof AuthenticateUser>;