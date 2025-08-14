import { db } from "db/connection.js";
import { tasks } from "db/schema.js";
import { eq, sql, and } from "drizzle-orm";
import type { CreateTaskPayload, UpdateTaskPayload } from "dtos/task.dto.js";

export const getTasksByUserId = async (userId: number) => {
  return await db.select().from(tasks).where(eq(tasks.owner, userId));
};

export const getTaskByTaskId = async (taskId: number) => {
  return await db.select().from(tasks).where(eq(tasks.id, taskId));
};

export const getTaskByUserIdAndTaskId = async (
  userId: number,
  taskId: number
) => {
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.owner, userId), eq(tasks.id, taskId)));
  return task;
};

export const insertTask = async (task: CreateTaskPayload) => {
  const result = await db.insert(tasks).values(task).returning();
  return result[0];
};

export const updateTaskByTaskId = async (
  taskId: number,
  task: UpdateTaskPayload
) => {
  const [updatedTask] = await db
    .update(tasks)
    .set({ ...task, updatedAt: sql`NOW()` })
    .where(eq(tasks.id, taskId))
    .returning();

  return updatedTask;
};

export const updateTaskStatusByUserIdAndTaskId = async (
  userId: number,
  taskId: number,
  isDone: boolean
) => {
  return await db
    .update(tasks)
    .set({ updatedAt: sql`NOW()`, isDone })
    .where(and(eq(tasks.owner, userId), eq(tasks.id, taskId)));
};

export const deleteTaskByUserIdAndTaskId = async (
  userId: number,
  taskId: number
) => {
  return await db
    .delete(tasks)
    .where(and(eq(tasks.owner, userId), eq(tasks.id, taskId)));
};
