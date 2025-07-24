import { Request, Response, NextFunction } from "express";
import { UserNotFoundError } from "services/user/userError.js";
import { findUserById } from "services/user/userService.js";
import { ApiError } from "utils/error.js";

export const getData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.user;
    const userData = await findUserById(userId);
    return res.status(200).send(userData);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      next(new ApiError(error.message, 404));
    } else if (error instanceof Error) {
      next(new ApiError(error.message ?? "Unknown Error", 500));
    } else {
      next(new ApiError("Unknown Error", 500));
    }
  }
};
