import { Router } from "express";
import {
  registerController,
  loginController,
  refreshAccessTokenController,
  enable2faController,
  verify2faController
} from "controllers/authController.js";
import {
  authCheck
} from "middlewares/auth.js"
import {
  checkUserId
} from "middlewares/checks.js";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refresh-access-token", refreshAccessTokenController);

router.post("/2fa/enable", authCheck, checkUserId, enable2faController);
router.post("/2fa/verify", authCheck, checkUserId, verify2faController);

export default router;
