import { Request, Response, NextFunction } from "express";
import { findUserById } from "services/index.js";
import { ApiError } from "utils/error.js";

export const checkUserId = async(req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user;
    const user = await findUserById(userId);
    if (!user) return next(new ApiError(`User with id ${userId} does not exist.`, 404));
    next();
}