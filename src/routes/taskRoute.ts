import { Router } from "express";
import * as controller from "../controllers/taskController.js";
import { authCheck } from "middlewares/auth.js";

const router = Router();

router.get("/task", authCheck, controller.getAllTasksByUserId);

export default router;