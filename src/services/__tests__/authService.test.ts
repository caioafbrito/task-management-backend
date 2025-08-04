import { describe, expect, it, type Mock, vi, beforeEach } from "vitest";
import * as AuthService from "services/auth/authService.js";

import * as Service from "services/index.js";
import * as AuthError from "services/auth/authError.js";

import * as EncryptUtil from "utils/encrypt.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import otp from "otplib";
import qrcode from "qrcode";
import { UserJwtPayload } from "types/jwtType.js";

vi.mock("services/index.js", () => ({
  findUserByEmail: vi.fn(),
  is2faEnabled: vi.fn(),
  generateTokensForLogin: vi.fn(),
  findUserById: vi.fn(),
  change2faSecret: vi.fn(),
  find2faSecretByUserId: vi.fn(),
}));

vi.mock("utils/encrypt.js", () => ({
  encryptSecret: vi.fn(),
  decryptSecret: vi.fn(),
}));

vi.mock("bcryptjs");
vi.mock("jsonwebtoken");
vi.mock("otplib");
vi.mock("qrcode");

const mockUser = {
  id: 1,
  name: "Caio Brito",
  age: 19,
  email: "caio@mail.com",
  password: "SOME_HASHED_PASS",
  "2faEnabled": true,
};

describe("AuthService.loginUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return that the password is incorrect (InvalidCredentials)", async () => {
    (Service.findUserByEmail as Mock).mockResolvedValueOnce(mockUser);
    (bcrypt.compare as Mock).mockResolvedValueOnce(false);

    const authData = {
      email: mockUser.email,
      password: "SOME_BAD_PASS",
    };

    await expect(AuthService.loginUser(authData)).rejects.toBeInstanceOf(
      AuthError.InvalidCredentialsError
    );

    // Just to make sure
    expect(Service.findUserByEmail).toHaveBeenCalledWith(authData.email, true);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      authData.password,
      mockUser.password
    );
  });

  it("should return authToken", async () => {
    (Service.findUserByEmail as Mock).mockResolvedValueOnce(mockUser);
    (bcrypt.compare as Mock).mockResolvedValueOnce(true);
    (Service.is2faEnabled as Mock).mockResolvedValueOnce(true);
    (jwt.sign as Mock).mockReturnValueOnce("authToken");

    const authData = {
      email: mockUser.email,
      password: mockUser.password,
    };

    await expect(AuthService.loginUser(authData)).resolves.toEqual({
      authToken: "authToken",
      is2faRequired: true,
    });

    expect(Service.findUserByEmail).toHaveBeenCalledWith(authData.email, true);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      authData.password,
      mockUser.password
    );
    expect(Service.is2faEnabled).toHaveBeenCalledWith(mockUser.id);
    expect(jwt.sign).toHaveBeenCalledWith(
      { userName: mockUser.name, userId: mockUser.id },
      process.env["2FA_TOKEN_SECRET"]!,
      {
        expiresIn: "1h",
      }
    );
  });

  it("should return accessToken and refreshToken", async () => {
    (Service.findUserByEmail as Mock).mockResolvedValueOnce(mockUser);
    (bcrypt.compare as Mock).mockResolvedValueOnce(true);
    (Service.is2faEnabled as Mock).mockResolvedValueOnce(false);
    (Service.generateTokensForLogin as Mock).mockReturnValueOnce({
      accessToken: "accessToken",
      refreshToken: "refreshToken",
    });

    const authData = {
      email: mockUser.email,
      password: mockUser.password,
    };

    await expect(AuthService.loginUser(authData)).resolves.toEqual({
      accessToken: "accessToken",
      refreshToken: "refreshToken",
      is2faRequired: false,
    });

    expect(Service.findUserByEmail).toHaveBeenCalledWith(authData.email, true);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      authData.password,
      mockUser.password
    );
    expect(Service.is2faEnabled).toHaveBeenCalledWith(mockUser.id);
    expect(Service.generateTokensForLogin).toHaveBeenCalledWith(
      mockUser.name,
      mockUser.id
    );
  });
});

describe("AuthService.generateTokensForLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should return accessToken and refreshToken", () => {
    const { name: userName, id: userId } = mockUser;
    (jwt.sign as Mock)
      .mockReturnValueOnce("accessToken")
      .mockReturnValueOnce("refreshToken");
    const tokens = AuthService.generateTokensForLogin(userName, userId);

    expect(jwt.sign).toHaveBeenCalledWith(
      { userName, userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10m" }
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      { userName, userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    expect(tokens).toEqual({
      accessToken: "accessToken",
      refreshToken: "refreshToken",
    });
  });
});

describe("AuthService.refreshAccessTokenForUser", () => {
  it("should return accessToken refreshed", () => {
    const refreshToken = "refreshToken";
    (jwt.verify as Mock).mockReturnValueOnce(true);
    (jwt.sign as Mock).mockReturnValueOnce("refreshedAccessToken");
    expect(AuthService.refreshAccessTokenForUser(refreshToken)).toEqual(
      "refreshedAccessToken"
    );
  });
});

describe("AuthService.is2faEnabled", () => {
  it("should call the service correctly and return properly", async () => {
    mockUser["2faEnabled"] = true;
    (Service.findUserById as Mock).mockResolvedValueOnce(mockUser);

    await expect(AuthService.is2faEnabled(mockUser.id)).resolves.toBe(true);
  });
});

describe("AuthService.generate2faQrCodeForUser", () => {
  it("should throw the error QrCodeGenerationError", async () => {
    const userPayload = {
      userName: mockUser.name,
      userId: mockUser.id,
    } as UserJwtPayload;

    (otp.authenticator.generateSecret as Mock).mockReturnValueOnce(
      "SOME_SECRET"
    );
    (EncryptUtil.encryptSecret as Mock).mockReturnValueOnce(
      "SOME_ENCRYPTED_SECRET"
    );
    (otp.authenticator.keyuri as Mock).mockReturnValueOnce("otpauth://..."); // otpauth://totp/{service}:{userName}?secret={tempSecret}&issuer={service}
    (qrcode.toBuffer as Mock).mockRejectedValueOnce(
      new Error("Some error while generating QR")
    );

    await expect(
      AuthService.generate2faQrCodeForUser(userPayload)
    ).rejects.Throw(AuthError.QrCodeGenerationError);
  });

  it("should return the buffer of the qrcode", async () => {
    const userPayload = {
      userName: mockUser.name,
      userId: mockUser.id,
    } as UserJwtPayload;

    (otp.authenticator.generateSecret as Mock).mockReturnValueOnce(
      "SOME_SECRET"
    );
    (EncryptUtil.encryptSecret as Mock).mockReturnValueOnce(
      "SOME_ENCRYPTED_SECRET"
    );
    (otp.authenticator.keyuri as Mock).mockReturnValueOnce("otpauth://..."); // otpauth://totp/{service}:{userName}?secret={tempSecret}&issuer={service}
    (qrcode.toBuffer as Mock).mockResolvedValueOnce("QRCODE_BUFFER");

    await expect(
      AuthService.generate2faQrCodeForUser(userPayload)
    ).resolves.toBe("QRCODE_BUFFER");
  });
});

describe("AuthService.verify2fa", () => {
  it("should throw the error CodeNotValidError", async () => {
    const { id: userId } = mockUser;
    const code = "NOT_VALID_CODE";
    (Service.find2faSecretByUserId as Mock).mockResolvedValueOnce(
      "ENCRYPTED_SECRET"
    );
    (EncryptUtil.decryptSecret as Mock).mockReturnValueOnce("PLAIN_SECRET");
    (otp.authenticator.check as Mock).mockReturnValueOnce(false);

    await expect(AuthService.verify2fa(userId, code)).rejects.Throw(
      AuthError.CodeNotValidError
    );
  });

  // maybe there is a misconception of the Service enabling 2fa and contacting database
  it("")
});
