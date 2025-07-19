import { NextFunction, Request, Response } from "express";
import { ApiError } from "utils/error.js";
import { registerUser, loginUser } from "services/index.js";
import { fromZodError } from "zod-validation-error/v4";
import { DuplicatedUserEmailError, UserNotFoundError, InvalidCredentialsError } from "services/indexError.js";
import { CreateUserDto, AuthenticateUserDto } from "dtos/user.dto.js";

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
