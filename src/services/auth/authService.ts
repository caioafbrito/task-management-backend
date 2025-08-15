import type { AuthenticateUser, UserPrivate } from "dtos/user.dto.js";
import type { UserJwt, UserJwtPayload } from "types/jwtType.js";
import * as AuthError from "./authError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticator } from "otplib";
import qrcode from "qrcode";
import * as EncryptUtil from "utils/encrypt.js";

export function createAuthService(
  userService: ReturnType<
    typeof import("services/user/userService.js").createUserService
  >
) {
  async function loginUser(authData: AuthenticateUser) {
    const { email, password } = authData;
    const {
      password: hashedPass,
      id: userId,
      name: userName,
    } = (await userService.findUserByEmail(email, true)) as UserPrivate;

    const isPassCorrect = await bcrypt.compare(password, hashedPass);
    if (!isPassCorrect) throw new AuthError.InvalidCredentialsError();

    const isEnabled = await userService
      .findUserById(userId)
      .then((u) => u["2faEnabled"]);

    if (isEnabled) {
      const authToken = jwt.sign(
        { userName, userId },
        process.env["2FA_TOKEN_SECRET"]!,
        { expiresIn: "1h" }
      );
      return {
        is2faRequired: true,
        authToken,
      };
    }

    const { accessToken, refreshToken } = generateTokensForLogin(
      userName,
      userId
    );

    return {
      is2faRequired: false,
      accessToken,
      refreshToken,
    };
  }

  function generateTokensForLogin(userName: string, userId: number) {
    const accessToken = jwt.sign(
      { userName, userId },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "10m" }
    );
    const refreshToken = jwt.sign(
      { userName, userId },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  function refreshAccessTokenForUser(refreshToken: string) {
    const { userId, userName } = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as UserJwt;
    const accessToken = jwt.sign(
      { userName, userId },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "10m" }
    );
    return accessToken;
  }

  async function is2faEnabled(userId: number) {
    const user = await userService.findUserById(userId);
    return user["2faEnabled"];
  }

  async function generate2faQrCodeForUser(jwtPayload: UserJwtPayload) {
    const { userName, userId } = jwtPayload;
    const service = "Task Management";
    const tempSecret = authenticator.generateSecret();
    const encryptedSecret = EncryptUtil.encryptSecret(tempSecret);
    await userService.change2faSecret(userId, encryptedSecret);
    const otpauth = authenticator.keyuri(userName, service, tempSecret);
    console.log(otpauth)
    try {
      const buffer = await qrcode.toBuffer(otpauth);
      return buffer;
    } catch (err) {
      throw new AuthError.QrCodeGenerationError();
    }
  }

  async function verify2fa(
    userId: number,
    code: string,
    setupMode: boolean = true
  ): Promise<void> {
    const encryptedSecret = await userService.find2faSecretByUserId(userId);
    const decryptedSecret = EncryptUtil.decryptSecret(encryptedSecret);
    const isValid = authenticator.check(code, decryptedSecret);
    if (!isValid) throw new AuthError.CodeNotValidError();
    if (setupMode) await userService.enable2faByUserId(userId);
  }

  return {
    loginUser,
    generateTokensForLogin,
    refreshAccessTokenForUser,
    is2faEnabled,
    generate2faQrCodeForUser,
    verify2fa,
  };
}
