import { NextFunction, Request, Response } from "express";
import * as Service from "services/index.js";
import * as ServiceError from "services/indexError.js";
import * as Util from "utils/index.js";
import * as Dto from "dtos/index.dto.js";
import { fromZodError } from "zod-validation-error/v4";
import jwt from "jsonwebtoken";
import { UserJwtPayload } from "types/jwtType.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const result = Dto.CreateUser.safeParse(body);
    if (!result.success)
      throw new Util.ApiError(fromZodError(result.error).toString(), 422);
    const registeredUser = await Service.registerUser(result.data);
    return res.status(201).send(registeredUser);
  } catch (error) {
    if (error instanceof ServiceError.DuplicatedUserEmailError) {
      next(new Util.ApiError(error.message, 409));
    } else if (error instanceof Util.ApiError) {
      next(error);
    } else if (error instanceof Error) {
      next(new Util.ApiError(error.message ?? "Unknown Error", 500));
    } else {
      next(new Util.ApiError("Unknown Error", 500));
    }
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const result = Dto.AuthenticateUser.safeParse(body);
    if (!result.success)
      throw new Util.ApiError(fromZodError(result.error).toString(), 422);
    const { is2faRequired, authToken, accessToken, refreshToken } =
      await Service.loginUser(result.data);
    if (is2faRequired) {
      return res.status(202).send({
        authToken,
      });
    } else {
      res.cookie("refreshToken", refreshToken, {
        maxAge: 7 * 24 * 3600 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });
      return res.status(200).send({
        accessToken,
      });
    }
  } catch (error) {
    if (error instanceof ServiceError.UserNotFoundError) {
      next(new Util.ApiError(error.message, 404));
    } else if (error instanceof ServiceError.InvalidCredentialsError) {
      next(new Util.ApiError(error.message, 401));
    } else if (error instanceof Util.ApiError) {
      next(error);
    } else if (error instanceof Error) {
      next(new Util.ApiError(error.message ?? "Unknown Error", 500));
    } else {
      next(new Util.ApiError("Unknown Error", 500));
    }
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cookies } = req;
    const { refreshToken } = cookies;
    if (!refreshToken)
      throw new Util.ApiError("refreshToken missing (cookie)", 400);
    const newAccessToken = await Service.refreshAccessTokenForUser(
      refreshToken
    );
    return res.status(200).send({
      newAccessToken,
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new Util.ApiError("Refresh token expired", 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(
        new Util.ApiError("Invalid refresh token or malformed request.", 401)
      );
    } else if (error instanceof jwt.NotBeforeError) {
      next(new Util.ApiError("Refresh token is not yet active", 401));
    } else if (error instanceof Util.ApiError) {
      next(error);
    } else if (error instanceof Error) {
      next(new Util.ApiError(error.message ?? "Unknown Error", 500));
    } else {
      next(new Util.ApiError("Unknown Error", 500));
    }
  }
};

export const enable2fa = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.type("png");
    const { userId } = req.user;
    const isEnabled = await Service.is2faEnabled(userId);
    if (isEnabled)
      return next(new Util.ApiError("The 2fa is already active.", 409));
    const imgPng = await Service.generate2faQrCodeForUser(
      req.user as UserJwtPayload
    );
    return res.status(200).send(imgPng);
  } catch (error) {
    if (error instanceof ServiceError.QrCodeGenerationError) {
      next(new Util.ApiError(error.message, 500));
    } else if (error instanceof Util.ApiError) {
      next(error);
    } else if (error instanceof Error) {
      next(new Util.ApiError(error.message ?? "Unknown Error", 500));
    } else {
      next(new Util.ApiError("Unknown Error", 500));
    }
  }
};

export const verify2fa = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { userName, userId } = req.user;
    const result = Dto.MultipleFactorAuthDto.safeParse(body);
    if (!result.success)
      throw new Util.ApiError(fromZodError(result.error).toString(), 422);
    await Service.verify2fa(userId, result.data.code);
    if (req.path === "/2fa/verify") {
      const { accessToken, refreshToken } = Service.generateTokensForLogin(
        userName,
        userId
      );
      res.cookie("refreshToken", refreshToken, {
        maxAge: 7 * 24 * 3600 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });
      return res.status(200).send({
        accessToken,
      });
    } else {
      return res.status(204).send();
    }
  } catch (error) {
    if (error instanceof ServiceError.SecretNotFoundError) {
      next(new Util.ApiError(error.message, 404));
    } else if (error instanceof ServiceError.CodeNotValidError) {
      next(new Util.ApiError(error.message, 400));
    } else if (error instanceof Util.ApiError) {
      next(error);
    } else if (error instanceof Error) {
      next(new Util.ApiError(error.message ?? "Unknown Error", 500));
    } else {
      next(new Util.ApiError("Unknown Error", 500));
    }
  }
};
