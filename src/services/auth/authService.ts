import {
  findUserById,
  findUserByEmail,
  change2faSecret,
  get2faSecret,
  enable2fa,
} from "../user/userService.js";
import * as AuthError from "./authError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AuthenticateUserDto } from "dtos/user.dto.js";
import { UserJwt, UserJwtPayload } from "types/jwtType.js";
import { authenticator } from "otplib";
import qrcode from "qrcode";
import { encryptSecret, decryptSecret } from "utils/encrypt.js";

export const loginUser = async (authData: AuthenticateUserDto) => {
  const { email, password } = authData;
  const {
    password: hashedPass,
    id: userId,
    name: userName,
  } = await findUserByEmail(email);

  const isPassCorrect = await bcrypt.compare(password, hashedPass);
  if (!isPassCorrect) throw new AuthError.InvalidCredentialsError();

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

export const refreshAccessToken = async (refreshToken: string) => {
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
  const user = await findUserById(userId);
  return user["2faEnabled"];
};

export const generate2faQrCode = async (jwtPayload: UserJwtPayload) => {
  const { userName, userId } = jwtPayload;
  const service = "Task Management";
  const tempSecret = authenticator.generateSecret();
  const encryptedSecret = encryptSecret(tempSecret);
  await change2faSecret(userId, encryptedSecret);
  const otpauth = authenticator.keyuri(userName, service, tempSecret);
  try {
    const buffer = await qrcode.toBuffer(otpauth);
    return buffer;
  } catch (err) {
    throw new AuthError.QrCodeGenerationError();
  }
};

export const verify2fa = async (userId: number, code: string) => {
  const encryptedSecret = await get2faSecret(userId);
  const decryptedSecret = decryptSecret(encryptedSecret);
  const isValid = authenticator.check(code, decryptedSecret);
  if (!isValid) throw new AuthError.CodeNotValidError();
  await enable2fa(userId);
};
