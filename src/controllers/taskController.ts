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

export const getTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.user;
  const result = Dto.TaskIdParam.safeParse(req.params);
  if (!result.success) {
    return next(new Util.ApiError(fromZodError(result.error).toString(), 400));
  }
  const task = await Service.listTasksByUserIdAndTaskId(
    userId,
    result.data.taskId
  );
  return res.status(200).send(task);
};

export const postTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.user;
  const result = Dto.CreateTask.safeParse(req.body);
  if (!result.success) {
    return next(new Util.ApiError(fromZodError(result.error).toString(), 422));
  }
  const task = await Service.createTask({ ...result.data, owner: userId });
  return res.status(201).send(task);
};

export const putTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.user;
  const paramResult = Dto.TaskIdParam.safeParse(req.params);
  const bodyResult = Dto.UpdateTask.safeParse(req.body);
  if (!paramResult.success || !bodyResult.success) {
    const errors = [];
    if (!paramResult.success)
      errors.push(fromZodError(paramResult.error).toString());
    if (!bodyResult.success)
      errors.push(fromZodError(bodyResult.error).toString());
    return next(new Util.ApiError(errors.join("\n"), 422));
  }
  const updatedTask = await Service.updateTaskByTaskId(
    paramResult.data.taskId,
    {
      ...bodyResult.data,
      owner: userId,
    }
  );
  return res.status(200).send(updatedTask);
};

export const patchTaskStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.user;
  const paramResult = Dto.TaskIdParam.safeParse(req.params);
  const bodyResult = Dto.ChangeTaskStatus.safeParse(req.body);
  if (!paramResult.success || !bodyResult.success) {
    const errors = [];
    if (!paramResult.success)
      errors.push(fromZodError(paramResult.error).toString());
    if (!bodyResult.success)
      errors.push(fromZodError(bodyResult.error).toString());
    return next(new Util.ApiError(errors.join("\n"), 422));
  }
  await Service.changeTaskStatusByUserIdAndTaskId(
    userId,
    paramResult.data.taskId,
    bodyResult.data.isDone
  );
  return res.status(204).send();
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.user;
  const result = Dto.TaskIdParam.safeParse(req.params);
  if (!result.success) {
    return next(new Util.ApiError(fromZodError(result.error).toString(), 400));
  }
  await Service.removeTaskByUserIdAndTaskId(userId, result.data.taskId);
  return res.status(204).send();
};
