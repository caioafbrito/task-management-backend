import * as Dto from "dtos/task.dto.js";
import type { Request, Response, NextFunction } from "express";
import * as Util from "utils/error.js";
import { fromZodError } from "zod-validation-error/v4";
import type { createTaskService } from "services/task/taskService.js";
import type { UserJwt } from "types/jwtType.js";

export function createTaskController(taskService: ReturnType<typeof createTaskService>) {
  async function getAllTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as UserJwt;
      const tasks = await taskService.listTasksByUserId(user.userId);
      return res.status(200).send(tasks);
    } catch (error) {
      next(error);
    }
  }

  async function getTask(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as UserJwt;
      const result = Dto.TaskIdParam.safeParse(req.params);
      if (!result.success) {
        return next(new Util.ApiError(fromZodError(result.error).toString(), 400));
      }
      const task = await taskService.listTasksByUserIdAndTaskId(user.userId, result.data.taskId);
      return res.status(200).send(task);
    } catch (error) {
      next(error);
    }
  }

  async function postTask(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as UserJwt;
      const result = Dto.CreateTask.safeParse(req.body);
      if (!result.success) {
        return next(new Util.ApiError(fromZodError(result.error).toString(), 422));
      }
      const task = await taskService.createTask({ ...result.data, owner: user.userId });
      return res.status(201).send(task);
    } catch (error) {
      next(error);
    }
  }

  async function putTask(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as UserJwt;
      const paramResult = Dto.TaskIdParam.safeParse(req.params);
      const bodyResult = Dto.UpdateTask.safeParse(req.body);
      if (!paramResult.success || !bodyResult.success) {
        const errors = [];
        if (!paramResult.success) errors.push(fromZodError(paramResult.error).toString());
        if (!bodyResult.success) errors.push(fromZodError(bodyResult.error).toString());
        return next(new Util.ApiError(errors.join("\n"), 422));
      }
      const updatedTask = await taskService.updateTaskByTaskId(paramResult.data.taskId, {
        ...bodyResult.data,
        owner: user.userId,
      });
      return res.status(200).send(updatedTask);
    } catch (error) {
      next(error);
    }
  }

  async function patchTaskStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as UserJwt;
      const paramResult = Dto.TaskIdParam.safeParse(req.params);
      const bodyResult = Dto.ChangeTaskStatus.safeParse(req.body);
      if (!paramResult.success || !bodyResult.success) {
        const errors = [];
        if (!paramResult.success) errors.push(fromZodError(paramResult.error).toString());
        if (!bodyResult.success) errors.push(fromZodError(bodyResult.error).toString());
        return next(new Util.ApiError(errors.join("\n"), 422));
      }
      await taskService.changeTaskStatusByUserIdAndTaskId(user.userId, paramResult.data.taskId, bodyResult.data.isDone);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async function deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as UserJwt;
      const result = Dto.TaskIdParam.safeParse(req.params);
      if (!result.success) {
        return next(new Util.ApiError(fromZodError(result.error).toString(), 400));
      }
      await taskService.removeTaskByUserIdAndTaskId(user.userId, result.data.taskId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  return {
    getAllTasks,
    getTask,
    postTask,
    putTask,
    patchTaskStatus,
    deleteTask,
  };
}
