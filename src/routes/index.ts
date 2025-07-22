import { Router } from "express";

import healthCheckRouter from "./healthCheckRoute.js";
import taskRouter from "./taskRoute.js";
import authRouter from "./authRoute.js";
import userRouter from "./userRoute.js";

const router = Router();
const BASE_API_PATH = process.env.BASE_API_PATH ?? "/api/v1";

router.use(BASE_API_PATH, healthCheckRouter, taskRouter, userRouter);
router.use(BASE_API_PATH + "/auth", authRouter);

export default router;
