import { Router } from "express";
import * as AuthController from "controllers/authController.js";
import * as Middleware from "middlewares/index.js";
import passport from "passport";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh-access-token", AuthController.refreshAccessToken);

// Protected JWT routes (middleware implementation)
router.post(
  "/2fa/verify",
  Middleware.multipleAuthCheck,
  AuthController.verify2fa
);

// Protected passport routes
router.post(
  "/2fa/enable",
  passport.authenticate("bearer", { session: false }),
  AuthController.enable2fa
);

router.post(
  "/2fa/setup/verify",
  passport.authenticate("bearer", { session: false }),
  AuthController.verify2fa
);

export default router;
