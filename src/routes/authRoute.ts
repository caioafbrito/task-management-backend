import { Router } from "express";
import * as AuthController from "controllers/authController.js";
import * as Middleware from "middlewares/index.js";

const router = Router();

router.post("/register", AuthController.registerController);
router.post("/login", AuthController.loginController);
router.post("/refresh-access-token", AuthController.refreshAccessTokenController);

router.post(
  "/2fa/enable",
  Middleware.authCheck,
  Middleware.checkUserId,
  AuthController.enable2faController
);

router.post(
  "/2fa/setup/verify",
  Middleware.authCheck,
  Middleware.checkUserId,
  AuthController.verify2faController
);

router.post(
  "/2fa/verify",
  Middleware.multipleAuthCheck,
  AuthController.verify2faController
)

export default router;
