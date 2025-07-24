import passport from "passport";
import { Strategy as BearerStrategy } from "passport-http-bearer";
import { findUserById } from "services/index.js";
import jwt from "jsonwebtoken";
import { UserJwtPayload } from "types/jwtType.js";
import { UserNotFoundError } from "services/indexError.js";

export default passport.use(
  new BearerStrategy(async (token, done) => {
    try {
      const payload = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as UserJwtPayload;
      const user = await findUserById(payload.userId);
      if (!user) throw new UserNotFoundError();
      done(null, payload);
    } catch (error) {
      done(error, null);
    }
  })
);
