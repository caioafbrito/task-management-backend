import { describe, expect, it, Mock, vi, beforeEach } from "vitest";
import * as AuthService from "services/auth/authService.js";

import * as Service from "services/index.js";
import * as AuthError from "services/auth/authError.js";

import bcrypt from "bcryptjs";

vi.mock("bcryptjs");

describe("AuthService.loginUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  const mockUser = {
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
  });
});
