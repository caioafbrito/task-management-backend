import type { Request, Response, NextFunction } from "express";
import { ApiError } from "utils/error.js";
import { UserNotFoundError } from "services/user/userError.js";
import type { createUserService } from "services/user/userService.js";
import type { UserJwt } from "types/jwtType.js";

export function createUserController(userService: ReturnType<typeof createUserService>) {
  async function getData(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as UserJwt;
      const userData = await userService.findUserById(user.userId);
      return res.status(200).send(userData);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return next(new ApiError(error.message, 404));
      }
      if (error instanceof Error) {
        return next(new ApiError(error.message ?? "Unknown Error", 500));
      }
      return next(new ApiError("Unknown Error", 500));
    }
  }

  return {
    getData,
  };
}
