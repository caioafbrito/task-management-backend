import { z } from "zod";

export const CreateTask = z.object({
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.iso.date().optional(),
  isDone: z.boolean().default(false),
});

export type CreateTask = z.infer<typeof CreateTask>;
export type CreateTaskPayload = CreateTask & { owner: number }; // for deep layers (services and models)

export const UpdateTask = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.iso.date().optional(),
  isDone: z.boolean().default(false).optional(),
  owner: z.number().nonnegative().optional(),
});

export type UpdateTask = z.infer<typeof UpdateTask>;
export type UpdateTaskPayload = UpdateTask & { owner: number };

export const TaskIdParam = z.object({
  taskId: z
    .string()
    .regex(/^\d+$/, "taskId param must be numeric.")
    .transform((string) => Number(string)),
});

export type TaskIdParam = z.infer<typeof TaskIdParam>;

export const ChangeTaskStatus = z.object({
  isDone: z.boolean()
});