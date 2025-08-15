import { Router } from "express";
import { factory } from "../factory.js";
import passport from "passport";

const router = Router();
const { taskController } = factory.controllers;

router.get(
  "/task",
  passport.authenticate("bearer", { session: false, failWithError: true }),
  taskController.getAllTasks
);

router.get(
  "/task/:taskId",
  passport.authenticate("bearer", { session: false, failWithError: true }),
  taskController.getTask
);

router.post(
  "/task",
  passport.authenticate("bearer", { session: false, failWithError: true }),
  taskController.postTask
);

router.put(
  "/task/:taskId",
  passport.authenticate("bearer", { session: false, failWithError: true }),
  taskController.putTask
);

router.patch(
  "/task/:taskId",
  passport.authenticate("bearer", { session: false, failWithError: true }),
  taskController.patchTaskStatus
);

router.delete(
  "/task/:taskId",
  passport.authenticate("bearer", { session: false, failWithError: true }),
  taskController.deleteTask
);

export default router;
