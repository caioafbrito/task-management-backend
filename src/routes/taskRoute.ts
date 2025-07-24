import { Router } from "express";
import * as TaskController from "controllers/taskController.js";
import passport from "passport";

const router = Router();

router.get(
  "/task",
  passport.authenticate("bearer", { session: false }),
  TaskController.getAllTasks
);

router.get(
  "/task/:taskId",
  passport.authenticate("bearer", { session: false }),
  TaskController.getTask
);

router.post(
  "/task",
  passport.authenticate("bearer", { session: false }),
  TaskController.postTask
);

router.put(
  "/task/:taskId",
  passport.authenticate("bearer", { session: false }),
  TaskController.putTask
);

router.patch(
  "/task/:taskId",
  passport.authenticate("bearer", { session: false }),
  TaskController.patchTaskStatus
);

router.delete(
  "/task/:taskId",
  passport.authenticate("bearer", { session: false }),
  TaskController.deleteTask
);

export default router;
