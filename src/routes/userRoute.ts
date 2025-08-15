import { Router } from "express";
import { factory } from "../factory.js";
import passport from "passport";

const router = Router();
const { userController } = factory.controllers;

router.get(
  "/user",
  passport.authenticate("bearer", { session: false, failWithError: true }),
  userController.getData
);

export default router;
