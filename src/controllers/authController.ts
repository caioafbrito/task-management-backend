import type { Request, Response, NextFunction } from "express";
import { fromZodError } from "zod-validation-error/v4";
import { ApiError } from "utils/index.js";
import * as Dto from "dtos/index.dto.js";
import type { UserJwt } from "types/jwtType.js";

export function createAuthController(
  authService: ReturnType<
    typeof import("services/auth/authService.js").createAuthService
  >,
  userService: ReturnType<
    typeof import("services/user/userService.js").createUserService
  >
) {
  async function register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = Dto.CreateUser.safeParse(req.body);
      if (!result.success)
        throw new ApiError(fromZodError(result.error).toString(), 422);

      const registeredUser = await userService.registerUser(result.data);
      return res.status(201).send(registeredUser);
    } catch (error: any) {
      if (error.name === "DuplicatedUserEmailError") {
        return next(new ApiError(error.message, 409));
      } else if (error instanceof ApiError) {
        return next(error);
      } else {
        return next(new ApiError(error.message ?? "Unknown Error", 500));
      }
    }
  }

  async function login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = Dto.AuthenticateUser.safeParse(req.body);
      if (!result.success)
        throw new ApiError(fromZodError(result.error).toString(), 422);

      const { is2faRequired, authToken, accessToken, refreshToken } =
        await authService.loginUser(result.data);

      if (is2faRequired) {
        return res.status(202).send({ authToken });
      } else {
        res.cookie("refreshToken", refreshToken, {
          maxAge: 7 * 24 * 3600 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        });
        return res.status(200).send({ accessToken });
      }
    } catch (error: any) {
      if (error.name === "UserNotFoundError") {
        return next(new ApiError(error.message, 404));
      } else if (error.name === "InvalidCredentialsError") {
        return next(new ApiError(error.message, 401));
      } else if (error instanceof ApiError) {
        return next(error);
      } else {
        return next(new ApiError(error.message ?? "Unknown Error", 500));
      }
    }
  }

  async function googleLoginCallback(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user as UserJwt;

      const { accessToken, refreshToken } = authService.generateTokensForLogin(
        user.userName,
        user.userId
      );
      res.cookie("refreshToken", refreshToken, {
        maxAge: 7 * 24 * 3600 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });
      return res.status(200).send({ accessToken });
    } catch (error) {
      next(error);
    }
  }

  async function refreshAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken)
        throw new ApiError("refreshToken missing (cookie)", 400);
      const newAccessToken = await authService.refreshAccessTokenForUser(
        refreshToken
      );
      return res.status(200).send({ newAccessToken });
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return next(new ApiError("Refresh token expired", 401));
      } else if (error.name === "JsonWebTokenError") {
        return next(
          new ApiError("Invalid refresh token or malformed request.", 401)
        );
      } else if (error.name === "NotBeforeError") {
        return next(new ApiError("Refresh token is not yet active", 401));
      } else if (error instanceof ApiError) {
        return next(error);
      } else {
        return next(new ApiError(error.message ?? "Unknown Error", 500));
      }
    }
  }

  async function enable2fa(req: Request, res: Response, next: NextFunction) {
    try {
      res.type("png");
      const user = req.user as UserJwt;

      const isEnabled = await authService.is2faEnabled(user.userId);
      if (isEnabled) {
        return next(new ApiError("The 2fa is already active.", 409));
      }
      const imgPng = await authService.generate2faQrCodeForUser({
        userId: user.userId,
        userName: user.userName,
      });
      return res.status(200).send(imgPng);
    } catch (error: any) {
      if (error.name === "QrCodeGenerationError") {
        return next(new ApiError(error.message, 500));
      }
      if (error instanceof ApiError) {
        return next(error);
      }
      return next(new ApiError(error.message ?? "Unknown Error", 500));
    }
  }

  async function verify2fa(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as UserJwt;

      const result = Dto.MultipleFactorAuthDto.safeParse(req.body);
      if (!result.success)
        throw new ApiError(fromZodError(result.error).toString(), 422);

      if (req.path === "/2fa/verify") {
        await authService.verify2fa(user.userId, result.data.code, false);

        const { accessToken, refreshToken } =
          authService.generateTokensForLogin(user.userName, user.userId);
        res.cookie("refreshToken", refreshToken, {
          maxAge: 7 * 24 * 3600 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        });
        return res.status(200).send({ accessToken });
      } else {
        // Setup mode
        await authService.verify2fa(user.userId, result.data.code);
        return res.status(204).send();
      }
    } catch (error: any) {
      if (error.name === "SecretNotFoundError") {
        return next(new ApiError(error.message, 404));
      } else if (error.name === "CodeNotValidError") {
        return next(new ApiError(error.message, 400));
      } else if (error instanceof ApiError) {
        return next(error);
      } else {
        return next(new ApiError(error.message ?? "Unknown Error", 500));
      }
    }
  }

  return {
    register,
    login,
    googleLoginCallback,
    refreshAccessToken,
    enable2fa,
    verify2fa,
  };
}
