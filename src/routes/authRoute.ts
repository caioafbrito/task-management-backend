import { Router } from "express";
import { factory } from "../factory.js";
import * as Middleware from "middlewares/index.js";
import passport from "passport";

const router = Router();
const { authController } = factory.controllers;

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get(
  "/login/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  process.env.REDIRECT_PATH!,
  passport.authenticate("google", { session: false, failWithError: true }),
  authController.googleLoginCallback
);

router.post("/refresh-access-token", authController.refreshAccessToken);

router.post(
  "/2fa/verify",
  Middleware.multipleAuthCheck,
  authController.verify2fa
);

router.post(
  "/2fa/enable",
  passport.authenticate("bearer", { session: false, failWithError: true }),
  authController.enable2fa
);

router.post(
  "/2fa/setup/verify",
  passport.authenticate("bearer", { session: false, failWithError: true }),
  authController.verify2fa
);

export default router;
