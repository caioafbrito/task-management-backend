import * as TaskDto from "dtos/task.dto.js";
import * as TaskModel from "models/taskModel.js";

export const listTasksByUserId = async (userId: number) => {
  return await TaskModel.getTasksByUserId(userId);
};

export const listTasksByUserIdAndTaskId = async (
  userId: number,
  taskId: number
) => {
  return await TaskModel.getTaskByUserIdAndTaskId(userId, taskId);
};

export const createTask = async (task: TaskDto.CreateTaskPayload) => {
  return await TaskModel.insertTask(task);
};

export const updateTaskByTaskId = async (
  taskId: number,
  task: TaskDto.UpdateTaskPayload
) => {
  return await TaskModel.updateTaskByTaskId(taskId, task);
};

export const changeTaskStatusByUserIdAndTaskId = async (
  userId: number,
  taskId: number,
  isDone: boolean
) => {
  const result = await TaskModel.updateTaskStatusByUserIdAndTaskId(
    userId,
    taskId,
    isDone
  );
  return result.rowCount;
};

export const removeTaskByUserIdAndTaskId = async (
  userId: number,
  taskId: number
) => {
  const result = await TaskModel.deleteTaskByUserIdAndTaskId(userId, taskId);
  return result.rowCount;
};
