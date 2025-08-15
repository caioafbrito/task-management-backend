import * as TaskDto from "dtos/task.dto.js";

export function createTaskService(
  taskModel: ReturnType<typeof import("models/taskModel.js").createTaskModel>
) {
  async function listTasksByUserId(userId: number) {
    return await taskModel.getTasksByUserId(userId);
  }

  async function listTasksByUserIdAndTaskId(userId: number, taskId: number) {
    return await taskModel.getTaskByUserIdAndTaskId(userId, taskId);
  }

  async function createTask(task: TaskDto.CreateTaskPayload) {
    return await taskModel.insertTask(task);
  }

  async function updateTaskByTaskId(
    taskId: number,
    task: TaskDto.UpdateTaskPayload
  ) {
    return await taskModel.updateTaskByTaskId(taskId, task);
  }

  async function changeTaskStatusByUserIdAndTaskId(
    userId: number,
    taskId: number,
    isDone: boolean
  ) {
    const result = await taskModel.updateTaskStatusByUserIdAndTaskId(
      userId,
      taskId,
      isDone
    );
    return result.rowCount;
  }

  async function removeTaskByUserIdAndTaskId(userId: number, taskId: number) {
    const result = await taskModel.deleteTaskByUserIdAndTaskId(userId, taskId);
    return result.rowCount;
  }

  return {
    listTasksByUserId,
    listTasksByUserIdAndTaskId,
    createTask,
    updateTaskByTaskId,
    changeTaskStatusByUserIdAndTaskId,
    removeTaskByUserIdAndTaskId,
  };
}
