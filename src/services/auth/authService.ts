import * as Service from "services/index.js";
import * as AuthError from "./authError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AuthenticateUser, UserPrivate } from "dtos/user.dto.js";
import { UserJwt, UserJwtPayload } from "types/jwtType.js";
import { authenticator } from "otplib";
import qrcode from "qrcode";
import * as EncryptUtil from "utils/encrypt.js";

export const loginUser = async (authData: AuthenticateUser) => {
  const { email, password } = authData;
  const {
    password: hashedPass,
    id: userId,
    name: userName,
  } = (await Service.findUserByEmail(email, true)) as UserPrivate;

  const isPassCorrect = await bcrypt.compare(password, hashedPass);
  if (!isPassCorrect) throw new AuthError.InvalidCredentialsError();

  const isEnabled = await Service.is2faEnabled(userId);

  if (isEnabled) {
    const authToken = jwt.sign(
      { userName, userId },
      process.env["2FA_TOKEN_SECRET"]!,
      {
        expiresIn: "1h",
      }
    );
    return {
      is2faRequired: true,
      authToken,
    };
  }

  const { accessToken, refreshToken } = Service.generateTokensForLogin(
    userName,
    userId
  );

  return {
    is2faRequired: false,
    accessToken,
    refreshToken,
  };
};

export const generateTokensForLogin = (userName: string, userId: number) => {
  const accessToken = jwt.sign(
    { userName, userId },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: "10m",
    }
  );

  const refreshToken = jwt.sign(
    { userName, userId },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "7d",
    }
  );
  return {
    accessToken,
    refreshToken,
  };
};

export const refreshAccessTokenForUser = (refreshToken: string) => {
  const { userId, userName } = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET!
  ) as UserJwt;
  const accessToken = jwt.sign(
    { userName, userId },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: "10m",
    }
  );
  return accessToken;
};

export const is2faEnabled = async (userId: number) => {
  const user = await Service.findUserById(userId);
  return user["2faEnabled"];
};

export const generate2faQrCodeForUser = async (jwtPayload: UserJwtPayload) => {
  const { userName, userId } = jwtPayload;
  const service = "Task Management";
  const tempSecret = authenticator.generateSecret();
  const encryptedSecret = EncryptUtil.encryptSecret(tempSecret);
  await Service.change2faSecret(userId, encryptedSecret);
  const otpauth = authenticator.keyuri(userName, service, tempSecret);
  try {
    const buffer = await qrcode.toBuffer(otpauth);
    return buffer;
  } catch (err) {
    throw new AuthError.QrCodeGenerationError();
  }
};

export const verify2fa = async (
  userId: number,
  code: string,
  setupMode: boolean = true
): Promise<void> => {
  const encryptedSecret = await Service.find2faSecretByUserId(userId);
  const decryptedSecret = EncryptUtil.decryptSecret(encryptedSecret);
  const isValid = authenticator.check(code, decryptedSecret);
  if (!isValid) throw new AuthError.CodeNotValidError();
  if (setupMode) await Service.enable2faByUserId(userId);
};
