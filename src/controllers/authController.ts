import { NextFunction, Request, Response } from "express";
import { ApiError } from "utils/error.js";
import { loginUser } from "services/auth/authService.js";
import { z } from "zod";
import { fromZodError } from "zod-validation-error/v4";
import { UserNotFoundError } from "services/user/userError.js";
import { InvalidCredentialsError } from "services/auth/authError.js";

const RegisterBody = z.object({
    name: z.string().max(255),
    age: z.number().gt(0),
    email: z.email().max(255),
    password: z.string(),
    '2fa_enabled': z.boolean().optional().default(false),
});

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body } = req;
        const result = RegisterBody.safeParse(body);
        if (!result.success) throw new ApiError(fromZodError(result.error).toString(), 422);
        const { name, age, email, password } = result.data;
        // Register logic
        return res.status(200).send();
    } catch (error) {
        // Error handling
        return res.status(500).send();
    }
}

const LoginBody = z.object({
    email: z.email("Invalid e-mail provided."),
    password: z.string()
});

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body } = req;
        const result = LoginBody.safeParse(body);
        if (!result.success) throw new ApiError(fromZodError(result.error).toString(), 422);
        const { email, password } = result.data;
        const { accessToken, refreshToken } = await loginUser(email, password);
        return res.status(200).send({
            accessToken,
            refreshToken
        });
    } catch (error) {
        if (error instanceof UserNotFoundError) {
            next(new ApiError(error.message, 404));
        } else if (error instanceof InvalidCredentialsError) {
            next(new ApiError(error.message, 401));
        } else if (error instanceof ApiError) {
            next(error);
        } else {
            next(new ApiError("Unknown Error", 500));
        }
    }
}
