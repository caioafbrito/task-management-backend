import { Router } from "express";
import { createAuthRouter } from "./authRoute.js";
import { createTaskRouter } from "./taskRoute.js";
import { createUserRouter } from "./userRoute.js";
import healthCheckRouter from "./healthCheckRoute.js";

const BASE_API_PATH = process.env.BASE_API_PATH ?? "/api/v1";

export function createRouters(
  factory: ReturnType<typeof import("../factory.js").createFactory>
) {
  const router = Router();

  router.use(BASE_API_PATH, healthCheckRouter);

  router.use(
    BASE_API_PATH + "/task",
    createTaskRouter(factory.controllers.taskController)
  );
  router.use(
    BASE_API_PATH + "/user",
    createUserRouter(factory.controllers.userController)
  );
  router.use(
    BASE_API_PATH + "/auth",
    createAuthRouter(factory.controllers.authController)
  );

  return router;
}
