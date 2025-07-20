import { Router } from "express";
import * as controller from "../controllers/taskController.js";
import { authCheck } from "middlewares/auth.js";
import { checkUserId } from "middlewares/checks.js";

const router = Router();

router.get("/tasks", authCheck, checkUserId, controller.getAllTasks);
router.post("/task", authCheck, checkUserId, controller.createTaskController);

export default router;
