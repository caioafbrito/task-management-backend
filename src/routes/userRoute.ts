import { Router } from "express";
import * as Middleware from "middlewares/index.js";
import * as Controller from "controllers/userController.js";

const router = Router();

router.get("/user", Middleware.authCheck, Middleware.checkUserId, Controller.getData);

export default router;