import db from "../db/connection.js";
import { tasks } from "db/schema.js";
import { eq, sql } from "drizzle-orm";
import type { CreateTaskPayload, UpdateTaskDto } from "dtos/task.dto.js";

export const getTasksByUserId = async (userId: number) => {
    return await db.select().from(tasks).where(eq(tasks.owner, userId));
}

export const getTaskByTaskId = async (taskId: number) => {
    return await db.select().from(tasks).where(eq(tasks.id, taskId));
}

export const createTask = async (task: CreateTaskPayload) => {
    return await db.insert(tasks).values(task);
}

export const updateTask = async (task: UpdateTaskDto) => {
    return await db.update(tasks).set({ ...task, updatedAt: sql`NOW()` }).where(eq(tasks.id, task.id));
}

export const updateTaskStatusByTaskId = async (taskId: number, isDone: boolean) => {
    return await db.update(tasks).set({ updatedAt: sql`NOW()`, isDone }).where(eq(tasks.id, taskId));
}

export const deleteTaskByTaskId = async (taskId: number) => {
    return await db.delete(tasks).where(eq(tasks.id, taskId));
}

