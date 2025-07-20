import { Router } from "express";
import {
  registerController,
  loginController,
  refreshAccessTokenController,
} from "controllers/authController.js";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refresh-access-token", refreshAccessTokenController);

export default router;
