import { CreateTaskDto } from "dtos/task.dto.js";
import { NextFunction, Request, Response } from "express";
import { listTasksByUserId, createNewTask } from "services/index.js";
import { ApiError } from "utils/error.js";
import { fromZodError } from "zod-validation-error/v4";

export const getAllTasks = async (req: Request, res: Response) => {
    const { userId } = req.user;
    const tasks = await listTasksByUserId(userId);
    return res.status(200).send(tasks);
};

export const createTaskController = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user;
    const result = CreateTaskDto.safeParse(req.body);
    if (!result.success) {
        return next(new ApiError(fromZodError(result.error).toString(), 422));
    }
    const task = await createNewTask({...result.data, owner: userId});
    return res.status(201).send(task);
};
