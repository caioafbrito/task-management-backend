import { NextFunction, Request, Response } from "express";
import { ApiError } from "utils/error.js";
import { registerUser, loginUser, refreshAccessToken } from "services/index.js";
import { fromZodError } from "zod-validation-error/v4";
import { DuplicatedUserEmailError, UserNotFoundError, InvalidCredentialsError } from "services/indexError.js";
import { CreateUserDto, AuthenticateUserDto } from "dtos/user.dto.js";
import jwt from "jsonwebtoken";

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body } = req;
        const result = CreateUserDto.safeParse(body);
        if (!result.success) throw new ApiError(fromZodError(result.error).toString(), 422);
        const registeredUser = await registerUser(result.data);
        return res.status(201).send(registeredUser);
    } catch (error) {
        if (error instanceof DuplicatedUserEmailError) {
            next(new ApiError(error.message, 409));
        } else if (error instanceof ApiError) {
            next(error);
        } else {
            next(new ApiError("Unknown Error", 500));
        }
    }
}


export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body } = req;
        const result = AuthenticateUserDto.safeParse(body);
        if (!result.success) throw new ApiError(fromZodError(result.error).toString(), 422);
        const { accessToken, refreshToken } = await loginUser(result.data);
        res.cookie("refreshToken", refreshToken, {
            maxAge: 7 * 24 * 3600 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax"
        })
        return res.status(200).send({
            accessToken
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

export const refreshAccessTokenController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req;
        const { refreshToken } = cookies;
        if (!refreshToken) throw new ApiError("refreshToken missing (cookie)", 400);
        const newAccessToken = await refreshAccessToken(refreshToken);
        return res.status(200).send({
            newAccessToken
        });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            next(new ApiError("Refresh token expired", 401));
        } else if (error instanceof jwt.JsonWebTokenError) {
            next(new ApiError("Invalid refresh token or malformed request.", 401));
        } else if (error instanceof jwt.NotBeforeError) {
            next(new ApiError("Refresh token is not yet active", 401));
        } else {
            next(new ApiError("An unexpected authentication error occurred.", 500));
        }
    }
}
