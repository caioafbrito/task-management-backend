import { CreateTaskPayload, UpdateTaskDto } from "dtos/task.dto.js";
import * as taskModel from "models/taskModel.js"

export const listTasksByUserId = async(userId: number) => {
    return await taskModel.getTasksByUserId(userId);
}

export const createNewTask = async(task: CreateTaskPayload) => {
    console.log(task);
    return await taskModel.createTask(task);
}