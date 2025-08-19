import { Router } from "express";
import passport from "passport";

export function createUserRouter(
  userController: ReturnType<
    typeof import("../factory.js").createFactory
  >["controllers"]["userController"]
) {
  const router = Router();

  router.get(
    "/",
    passport.authenticate("bearer", { session: false, failWithError: true }),
    userController.getData
  );

  return router;
}
