import * as Dto from "dtos/task.dto.js";
import { NextFunction, Request, Response } from "express";
import * as Service from "services/index.js";
import * as Util from "utils/error.js";
import { fromZodError } from "zod-validation-error/v4";

export const getAllTasks = async (req: Request, res: Response) => {
  const { userId } = req.user;
  const tasks = await Service.listTasksByUserId(userId);
  return res.status(200).send(tasks);
};

export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.user;
  console.log(req.params);
  const result = Dto.GetTaskDto.safeParse(req.params);
  if (!result.success) {
    return next(new Util.ApiError(fromZodError(result.error).toString(), 400));
  }
  const task = await Service.listTasksByUserIdAndTaskId(
    userId,
    result.data.taskId
  );
  return res.status(200).send(task);
};

export const createTaskController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.user;
  const result = Dto.CreateTaskDto.safeParse(req.body);
  if (!result.success) {
    return next(new Util.ApiError(fromZodError(result.error).toString(), 422));
  }
  const task = await Service.createNewTask({ ...result.data, owner: userId });
  return res.status(201).send(task);
};
