import { Router } from "express";
import { getAllTasksByUserId } from "../controllers/taskController.js";

const router = Router();
router.get("/task", getAllTasksByUserId);

export default router;