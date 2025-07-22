import { Router } from "express";
import * as TaskController from "controllers/taskController.js";
import * as Middleware from "middlewares/index.js";

const router = Router();

router.get("/task", Middleware.authCheck, Middleware.checkUserId, TaskController.getAllTasks);
router.get("/task/:taskId", Middleware.authCheck, Middleware.checkUserId, TaskController.getTask)
router.post("/task", Middleware.authCheck, Middleware.checkUserId, TaskController.postTask);
router.put("/task/:taskId", Middleware.authCheck, Middleware.checkUserId, TaskController.putTask);

export default router;
