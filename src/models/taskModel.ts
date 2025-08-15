import { getDb } from "db/connection.js";
import { tasks } from "db/schema.js";
import { eq, sql, and } from "drizzle-orm";
import type { CreateTaskPayload, UpdateTaskPayload } from "dtos/task.dto.js";

export function createTaskModel(dbInstance = getDb().db) {
  async function getTasksByUserId(userId: number) {
    return await dbInstance.select().from(tasks).where(eq(tasks.owner, userId));
  }

  async function getTaskByTaskId(taskId: number) {
    return await dbInstance.select().from(tasks).where(eq(tasks.id, taskId));
  }

  async function getTaskByUserIdAndTaskId(userId: number, taskId: number) {
    const [task] = await dbInstance
      .select()
      .from(tasks)
      .where(and(eq(tasks.owner, userId), eq(tasks.id, taskId)));
    return task;
  }

  async function insertTask(task: CreateTaskPayload) {
    const result = await dbInstance.insert(tasks).values(task).returning();
    return result[0];
  }

  async function updateTaskByTaskId(taskId: number, task: UpdateTaskPayload) {
    const [updatedTask] = await dbInstance
      .update(tasks)
      .set({ ...task, updatedAt: sql`NOW()` })
      .where(eq(tasks.id, taskId))
      .returning();
    return updatedTask;
  }

  async function updateTaskStatusByUserIdAndTaskId(
    userId: number,
    taskId: number,
    isDone: boolean
  ) {
    return await dbInstance
      .update(tasks)
      .set({ updatedAt: sql`NOW()`, isDone })
      .where(and(eq(tasks.owner, userId), eq(tasks.id, taskId)));
  }

  async function deleteTaskByUserIdAndTaskId(userId: number, taskId: number) {
    return await dbInstance
      .delete(tasks)
      .where(and(eq(tasks.owner, userId), eq(tasks.id, taskId)));
  }

  return {
    getTasksByUserId,
    getTaskByTaskId,
    getTaskByUserIdAndTaskId,
    insertTask,
    updateTaskByTaskId,
    updateTaskStatusByUserIdAndTaskId,
    deleteTaskByUserIdAndTaskId,
  };
}
