import { z } from "zod";

export const CreateTaskDto = z.object({
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.iso.date().optional(),
  isDone: z.boolean().default(false),
});

export type CreateTaskDto = z.infer<typeof CreateTaskDto>;
export type CreateTaskPayload = CreateTaskDto & { owner: number }; // for deep layers (services and models)

export const UpdateTaskDto = z.object({
  id: z.number().nonnegative(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.iso.date().optional(),
  isDone: z.boolean().default(false),
  owner: z.number().nonnegative(),
});

export type UpdateTaskDto = z.infer<typeof UpdateTaskDto>;

export const GetTaskDto = z.object({
  taskId: z
    .string()
    .regex(/^\d+$/, "taskId param must be numeric.")
    .transform((string) => Number(string)),
});

export type GetTaskDto = z.infer<typeof GetTaskDto>;
