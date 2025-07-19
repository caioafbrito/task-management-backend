import { Router } from "express";
import * as controller from "../controllers/taskController.js";
import { authCheck } from "middlewares/auth.js";

const router = Router();

router.get("/tasks", authCheck, controller.getAllTasks);
router.post("/task", authCheck, controller.createTaskController);

export default router;