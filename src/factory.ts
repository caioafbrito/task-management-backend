import { createUserModel } from "./models/userModel.js";
import { createTaskModel } from "./models/taskModel.js";
import { createUserService } from "./services/user/userService.js";
import { createTaskService } from "./services/task/taskService.js";
import { createAuthService } from "./services/auth/authService.js";
import { createUserController } from "./controllers/userController.js";
import { createTaskController } from "./controllers/taskController.js";
import { createAuthController } from "./controllers/authController.js";
import { getDb } from "./db/connection.js";

type DbInstance = ReturnType<typeof getDb>["db"];

function getDbForEnv(): DbInstance {
  if (process.env.NODE_ENV === "test") {
    return getDb(process.env.DATABASE_URL).db;
  }
  return getDb().db;
}

function buildFactory(db: DbInstance) {
  const userModel = createUserModel(db);
  const taskModel = createTaskModel(db);

  const userService = createUserService(userModel);
  const taskService = createTaskService(taskModel);
  const authService = createAuthService(userService);

  const userController = createUserController(userService);
  const taskController = createTaskController(taskService);
  const authController = createAuthController(authService, userService);

  return {
    models: { userModel, taskModel },
    services: { userService, taskService, authService },
    controllers: { userController, taskController, authController },
  };
}

const db = getDbForEnv();
export const factory = buildFactory(db);

export { buildFactory };
