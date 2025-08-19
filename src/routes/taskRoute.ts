import { Router } from "express";
import passport from "passport";

export function createTaskRouter(
  taskController: ReturnType<
    typeof import("../factory.js").createFactory
  >["controllers"]["taskController"]
) {
  const router = Router();

  router.get(
    "/",
    passport.authenticate("bearer", { session: false, failWithError: true }),
    taskController.getAllTasks
  );

  router.get(
    "/:taskId",
    passport.authenticate("bearer", { session: false, failWithError: true }),
    taskController.getTask
  );

  router.post(
    "/",
    passport.authenticate("bearer", { session: false, failWithError: true }),
    taskController.postTask
  );

  router.put(
    "/:taskId",
    passport.authenticate("bearer", { session: false, failWithError: true }),
    taskController.putTask
  );

  router.patch(
    "/:taskId",
    passport.authenticate("bearer", { session: false, failWithError: true }),
    taskController.patchTaskStatus
  );

  router.delete(
    "/:taskId",
    passport.authenticate("bearer", { session: false, failWithError: true }),
    taskController.deleteTask
  );

  return router;
}
