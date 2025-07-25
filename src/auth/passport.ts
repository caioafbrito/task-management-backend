import passport from "passport";
import { Strategy as BearerStrategy } from "passport-http-bearer";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import {
  findUserById,
  findUserByGoogleId,
  registerUser,
} from "services/index.js";
import jwt from "jsonwebtoken";
import { UserJwtPayload } from "types/jwtType.js";
import { UserNotFoundError } from "services/indexError.js";

passport.use(
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

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      callbackURL: process.env.REDIRECT_URI!,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done
    ) => {
      let user;
      try {
        user = await findUserByGoogleId(profile.id);
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          user = await registerUser(
            {
              "2fa_enabled": false,
              email: profile.emails?.find((email) => email)?.value ?? "",
              name: profile.displayName,
              googleId: profile.id,
            },
            "google"
          );
        } else {
          console.error("Unknown auth error in google login", error);
          return done(error, undefined);
        }
      }
      return done(null, user);
    }
  )
);

export default passport;
