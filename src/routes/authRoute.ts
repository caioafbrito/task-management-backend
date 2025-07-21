import { Router } from "express";
import * as AuthController from "controllers/authController.js";
import * as Middleware from "middlewares/index.js";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh-access-token", AuthController.refreshAccessToken);

router.post(
  "/2fa/enable",
  Middleware.authCheck,
  Middleware.checkUserId,
  AuthController.enable2fa
);

router.post(
  "/2fa/setup/verify",
  Middleware.authCheck,
  Middleware.checkUserId,
  AuthController.verify2fa
);

router.post(
  "/2fa/verify",
  Middleware.multipleAuthCheck,
  AuthController.verify2fa
);

export default router;
