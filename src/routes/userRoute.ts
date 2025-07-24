import { Router } from "express";
import * as Controller from "controllers/userController.js";
import passport from "passport";

const router = Router();

router.get(
  "/user",
  passport.authenticate("bearer", { session: false }),
  Controller.getData
);

export default router;
