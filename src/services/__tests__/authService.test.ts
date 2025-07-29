import * as AuthService from "../auth/authService.js";
import * as AuthError from "../auth/authError.js";

import * as Service from "../index.js";
import bcrypt from "bcryptjs";

jest.mock("../index");
jest.mock("bcryptjs");

describe("AuthService.loginUser", () => {
  const mockUser = {
    id: 1,
    name: "Some User",
    email: "someuser@mail.com",
    password: "SOME_TRUSTY_HASHED_PASS",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return that the password is incorrect.", async () => {
    // Arrange (arrange the cenario for the test, inputs and returned values for mock functions)
    const authData = {
      email: "someuser@mail.com",
      password: "SOME_BAD_PASS",
    };

    (Service.findUserByEmail as jest.Mock).mockResolvedValueOnce(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

    // Act
    const act = () => AuthService.loginUser(authData);

    // Assert
    await expect(act()).rejects.toThrow(AuthError.InvalidCredentialsError);
    expect(Service.findUserByEmail).toHaveBeenCalledWith(authData.email, true);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      authData.password,
      mockUser.password
    );
  });
});
