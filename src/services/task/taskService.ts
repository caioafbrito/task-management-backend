import * as TaskDto from "dtos/task.dto.js";
import * as TaskModel from "models/taskModel.js"

export const listTasksByUserId = async(userId: number) => {
    return await TaskModel.getTasksByUserId(userId);
}

export const createNewTask = async(task: TaskDto.CreateTaskPayload) => {
    return await TaskModel.createTask(task);
}