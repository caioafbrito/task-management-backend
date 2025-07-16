import { Router } from "express";
import * as controller from "../controllers/taskController.js";

const router = Router();

router.get("/task", controller.getAllTasksByUserId);

export default router;