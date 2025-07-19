import { z } from "zod";

export const CreateUserDto = z.object({
    name: z.string().max(255),
    age: z.number().gt(0),
    email: z.email().max(255),
    password: z.string(),
    '2fa_enabled': z.boolean().optional().default(false),
});

export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const AuthenticateUserDto = z.object({
    email: z.email("Invalid e-mail provided."),
    password: z.string()
});

export type AuthenticateUserDto = z.infer<typeof AuthenticateUserDto>;