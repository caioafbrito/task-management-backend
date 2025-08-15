import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import { createAuthService } from "services/auth/authService.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import otp from "otplib";
import qrcode from "qrcode";
import * as EncryptUtil from "utils/encrypt.js";
import * as AuthError from "services/auth/authError.js";

const mockUserService = {
  findUserByEmail: vi.fn(),
  is2faEnabled: vi.fn(),
  findUserById: vi.fn(),
  change2faSecret: vi.fn(),
  find2faSecretByUserId: vi.fn(),
  enable2faByUserId: vi.fn(),
  findUserByGoogleId: vi.fn(),
  registerUser: vi.fn(),
  disable2faByUserId: vi.fn(),
};

vi.mock("bcryptjs");
vi.mock("jsonwebtoken");
vi.mock("otplib");
vi.mock("qrcode");
vi.mock("utils/encrypt.js", () => ({
  encryptSecret: vi.fn(),
  decryptSecret: vi.fn(),
}));

const AuthService = createAuthService(mockUserService);

const mockUser = {
  id: 1,
  name: "Caio Brito",
  age: 19,
  email: "caio@mail.com",
  password: "SOME_HASHED_PASS",
  "2faEnabled": true,
};

describe("AuthService - User Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws InvalidCredentialsError when password is incorrect", async () => {
    (mockUserService.findUserByEmail as Mock).mockResolvedValueOnce(mockUser);
    (bcrypt.compare as Mock).mockResolvedValueOnce(false);

    const authData = {
      email: mockUser.email,
      password: "wrong_password",
    };

    await expect(AuthService.loginUser(authData)).rejects.toBeInstanceOf(
      AuthError.InvalidCredentialsError
    );

    expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(
      authData.email,
      true
    );
    expect(bcrypt.compare).toHaveBeenCalledWith(
      authData.password,
      mockUser.password
    );
  });

  it("returns authToken and requires 2FA when 2FA is enabled", async () => {
    (mockUserService.findUserByEmail as Mock).mockResolvedValueOnce(mockUser);
    (bcrypt.compare as Mock).mockResolvedValueOnce(true);
    (mockUserService.findUserById as Mock).mockResolvedValueOnce({
      ...mockUser,
      "2faEnabled": true,
    });
    (jwt.sign as Mock).mockReturnValueOnce("authToken");

    const authData = {
      email: mockUser.email,
      password: mockUser.password,
    };

    await expect(AuthService.loginUser(authData)).resolves.toEqual({
      authToken: "authToken",
      is2faRequired: true,
    });
  });

  it("returns access and refresh tokens when 2FA is not enabled", async () => {
    (mockUserService.findUserByEmail as Mock).mockResolvedValueOnce(mockUser);
    (bcrypt.compare as Mock).mockResolvedValueOnce(true);
    (mockUserService.findUserById as Mock).mockResolvedValueOnce({
      ...mockUser,
      "2faEnabled": false,
    });
    (jwt.sign as Mock)
      .mockReturnValueOnce("accessToken")
      .mockReturnValueOnce("refreshToken");

    const authData = {
      email: mockUser.email,
      password: mockUser.password,
    };

    await expect(AuthService.loginUser(authData)).resolves.toEqual({
      accessToken: "accessToken",
      refreshToken: "refreshToken",
      is2faRequired: false,
    });
  });
});

describe("AuthService - Token Generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates valid access and refresh tokens", () => {
    const { name: userName, id: userId } = mockUser;

    (jwt.sign as Mock)
      .mockReturnValueOnce("accessToken")
      .mockReturnValueOnce("refreshToken");

    const tokens = AuthService.generateTokensForLogin(userName, userId);

    expect(tokens).toEqual({
      accessToken: "accessToken",
      refreshToken: "refreshToken",
    });

    expect(jwt.sign).toHaveBeenNthCalledWith(
      1,
      { userName, userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10m" }
    );

    expect(jwt.sign).toHaveBeenNthCalledWith(
      2,
      { userName, userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
  });
});

describe("AuthService - Token Refresh", () => {
  it("refreshes access token based on valid refresh token", () => {
    const refreshToken = "refreshToken";

    (jwt.verify as Mock).mockReturnValueOnce({
      userId: mockUser.id,
      userName: mockUser.name,
    });
    (jwt.sign as Mock).mockReturnValueOnce("refreshedAccessToken");

    const newAccessToken = AuthService.refreshAccessTokenForUser(refreshToken);

    expect(newAccessToken).toEqual("refreshedAccessToken");

    expect(jwt.verify).toHaveBeenCalledWith(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      { userName: mockUser.name, userId: mockUser.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10m" }
    );
  });
});

describe("AuthService - Two-Factor Authentication (2FA)", () => {
  it("returns true if 2FA is enabled for user", async () => {
    (mockUserService.findUserById as Mock).mockResolvedValueOnce({
      ...mockUser,
      "2faEnabled": true,
    });

    await expect(AuthService.is2faEnabled(mockUser.id)).resolves.toBe(true);
  });

  it("throws QrCodeGenerationError on QR code generation failure", async () => {
    const userPayload = { userName: mockUser.name, userId: mockUser.id };

    (otp.authenticator.generateSecret as Mock).mockReturnValueOnce(
      "SOME_SECRET"
    );
    (EncryptUtil.encryptSecret as Mock).mockReturnValueOnce(
      "SOME_ENCRYPTED_SECRET"
    );
    (mockUserService.change2faSecret as Mock).mockResolvedValueOnce(undefined);
    (otp.authenticator.keyuri as Mock).mockReturnValueOnce("otpauth://...");
    (qrcode.toBuffer as Mock).mockRejectedValueOnce(
      new Error("QR generation error")
    );

    await expect(
      AuthService.generate2faQrCodeForUser(userPayload)
    ).rejects.toThrow(AuthError.QrCodeGenerationError);
  });

  it("returns QR code buffer on successful generation", async () => {
    const userPayload = { userName: mockUser.name, userId: mockUser.id };

    (otp.authenticator.generateSecret as Mock).mockReturnValueOnce(
      "SOME_SECRET"
    );
    (EncryptUtil.encryptSecret as Mock).mockReturnValueOnce(
      "SOME_ENCRYPTED_SECRET"
    );
    (mockUserService.change2faSecret as Mock).mockResolvedValueOnce(undefined);
    (otp.authenticator.keyuri as Mock).mockReturnValueOnce("otpauth://...");
    (qrcode.toBuffer as Mock).mockResolvedValueOnce("QRCODE_BUFFER");

    await expect(
      AuthService.generate2faQrCodeForUser(userPayload)
    ).resolves.toBe("QRCODE_BUFFER");
  });

  it("throws CodeNotValidError on invalid 2FA code", async () => {
    const userId = mockUser.id;
    const code = "INVALID_CODE";

    (mockUserService.find2faSecretByUserId as Mock).mockResolvedValueOnce(
      "ENCRYPTED_SECRET"
    );
    (EncryptUtil.decryptSecret as Mock).mockReturnValueOnce("PLAIN_SECRET");
    (otp.authenticator.check as Mock).mockReturnValueOnce(false);

    await expect(AuthService.verify2fa(userId, code)).rejects.toThrow(
      AuthError.CodeNotValidError
    );
  });

  it("enables 2FA successfully after valid verification", async () => {
    const userId = mockUser.id;
    const code = "VALID_CODE";

    (mockUserService.find2faSecretByUserId as Mock).mockResolvedValueOnce(
      "ENCRYPTED_SECRET"
    );
    (EncryptUtil.decryptSecret as Mock).mockReturnValueOnce("PLAIN_SECRET");
    (otp.authenticator.check as Mock).mockReturnValueOnce(true);
    (mockUserService.enable2faByUserId as Mock).mockResolvedValueOnce(
      undefined
    );

    await expect(AuthService.verify2fa(userId, code)).resolves.toBeUndefined();
    expect(mockUserService.enable2faByUserId).toHaveBeenCalledWith(userId);
  });

  it("verifies 2FA successfully without enabling in non-setup mode", async () => {
    const userId = mockUser.id;
    const code = "VALID_CODE";

    (mockUserService.find2faSecretByUserId as Mock).mockResolvedValueOnce(
      "ENCRYPTED_SECRET"
    );
    (EncryptUtil.decryptSecret as Mock).mockReturnValueOnce("PLAIN_SECRET");
    (otp.authenticator.check as Mock).mockReturnValueOnce(true);

    await expect(
      AuthService.verify2fa(userId, code, false)
    ).resolves.toBeUndefined();
  });
});
