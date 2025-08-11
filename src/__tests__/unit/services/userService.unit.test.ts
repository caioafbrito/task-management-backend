import { describe, it, vi, beforeEach, Mock, expect } from "vitest";
import * as UserService from "services/user/userService.js";
import * as UserError from "services/user/userError.js";

import * as UserModel from "models/userModel.js";
import bcrypt from "bcryptjs";

vi.mock("bcryptjs");
vi.mock("models/userModel.js", () => ({
  findUserById: vi.fn(),
  findUserByGoogleId: vi.fn(),
  findUserByEmail: vi.fn(),
  insertUser: vi.fn(),
  update2faSecretByUserId: vi.fn(),
  find2faSecretByUserId: vi.fn(),
  update2faByUserId: vi.fn(),
}));

const mockUser = {
  id: 1,
  googleId: "GOOGLE_ID",
  name: "Caio Brito",
  age: 19,
  email: "caio@mail.com",
  password: "SOME_HASHED_PASS",
  "2faEnabled": true,
};

describe("UserService.findUserById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw UserNotFoundError", async () => {
    (UserModel.findUserById as Mock).mockResolvedValueOnce(undefined);

    await expect(UserService.findUserById(mockUser.id, true)).rejects.Throw(
      UserError.UserNotFoundError
    );

    expect(UserModel.findUserById).toHaveBeenCalledWith(mockUser.id, true);
  });

  it("should return the user", async () => {
    (UserModel.findUserById as Mock).mockResolvedValueOnce(mockUser);

    await expect(UserService.findUserById(mockUser.id, true)).resolves.toBe(
      mockUser
    );

    expect(UserModel.findUserById).toHaveBeenCalledWith(mockUser.id, true);
  });
});

describe("UserService.findUserByGoogleId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw UserNotFoundError", async () => {
    (UserModel.findUserByGoogleId as Mock).mockResolvedValueOnce(undefined);

    await expect(
      UserService.findUserByGoogleId(mockUser.googleId, true)
    ).rejects.Throw(UserError.UserNotFoundError);

    expect(UserModel.findUserByGoogleId).toHaveBeenCalledWith(
      mockUser.googleId,
      true
    );
  });

  it("should return the user", async () => {
    (UserModel.findUserByGoogleId as Mock).mockResolvedValueOnce(mockUser);

    await expect(
      UserService.findUserByGoogleId(mockUser.googleId, true)
    ).resolves.toBe(mockUser);

    expect(UserModel.findUserByGoogleId).toHaveBeenCalledWith(
      mockUser.googleId,
      true
    );
  });
});

describe("UserService.findUserByEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw UserNotFoundError", async () => {
    (UserModel.findUserByEmail as Mock).mockResolvedValueOnce(undefined);

    await expect(UserService.findUserByEmail(mockUser.email)).rejects.Throw(
      UserError.UserNotFoundError
    );

    expect(UserModel.findUserByEmail).toHaveBeenCalledWith(
      mockUser.email,
      false
    );
  });

  it("should return the user", async () => {
    (UserModel.findUserByEmail as Mock).mockResolvedValueOnce(mockUser);

    await expect(UserService.findUserByEmail(mockUser.email)).resolves.toBe(
      mockUser
    );

    expect(UserModel.findUserByEmail).toHaveBeenCalledWith(
      mockUser.email,
      false
    );
  });
});

describe("UserService.registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw DuplicatedUserEmailError", async () => {
    (UserModel.findUserByEmail as Mock).mockResolvedValueOnce({
      ...mockUser,
      name: "Other User",
    });
    await expect(UserService.registerUser(mockUser)).rejects.Throw(
      UserError.DuplicatedUserEmailError
    );
    expect(UserModel.findUserByEmail).toHaveBeenCalledWith(mockUser.email);
  });
});
