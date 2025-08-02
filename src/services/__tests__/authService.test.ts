import { describe, expect, it, type Mock, vi, beforeEach } from "vitest";
import * as AuthService from "services/auth/authService.js";

import * as Service from "services/index.js";
import * as AuthError from "services/auth/authError.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

vi.mock("bcryptjs");
vi.mock("jsonwebtoken");
vi.mock("services/index.js", () => ({
  findUserByEmail: vi.fn(),
  is2faEnabled: vi.fn(),
}));

describe("AuthService.loginUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  const mockUser = {
    id: 1,
    name: "Caio Brito",
    age: 19,
    email: "caio@mail.com",
    password: "SOME_HASHED_PASS",
  };

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
});
