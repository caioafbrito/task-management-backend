import { Request, Response } from "express";
import { ApiError } from "utils/error.js";

export const getAllTasksByUserId = async (req: Request, res: Response) => {
    const { user } = req;
    return res.status(200).send(user);
};
