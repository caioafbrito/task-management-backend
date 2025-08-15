import { describe, it, vi, beforeEach, type Mock, expect } from "vitest";
import { createUserService } from "services/user/userService.js";
import * as UserError from "services/user/userError.js";
import bcrypt from "bcryptjs";

vi.mock("bcryptjs");

const mockUserModel = {
  findUserById: vi.fn(),
  findUserByGoogleId: vi.fn(),
  findUserByEmail: vi.fn(),
  insertUser: vi.fn(),
  update2faSecretByUserId: vi.fn(),
  find2faSecretByUserId: vi.fn(),
  update2faByUserId: vi.fn(),
};

const userService = createUserService(mockUserModel);

const mockUser = {
  id: 1,
  googleId: "GOOGLE_ID",
  name: "Caio Brito",
  age: 19,
  email: "caio@mail.com",
  password: "SOME_HASHED_PASS",
  "2faEnabled": true,
};

describe("UserService - findUserById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws UserNotFoundError if user not found by ID", async () => {
    (mockUserModel.findUserById as Mock).mockResolvedValueOnce(undefined);

    await expect(userService.findUserById(mockUser.id, true)).rejects.toThrow(
      UserError.UserNotFoundError
    );
    expect(mockUserModel.findUserById).toHaveBeenCalledWith(mockUser.id, true);
  });

  it("returns user when found by ID", async () => {
    (mockUserModel.findUserById as Mock).mockResolvedValueOnce(mockUser);

    await expect(userService.findUserById(mockUser.id, true)).resolves.toBe(
      mockUser
    );
    expect(mockUserModel.findUserById).toHaveBeenCalledWith(mockUser.id, true);
  });
});

describe("UserService - findUserByGoogleId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws UserNotFoundError if user not found by Google ID", async () => {
    (mockUserModel.findUserByGoogleId as Mock).mockResolvedValueOnce(undefined);

    await expect(
      userService.findUserByGoogleId(mockUser.googleId, true)
    ).rejects.toThrow(UserError.UserNotFoundError);
    expect(mockUserModel.findUserByGoogleId).toHaveBeenCalledWith(
      mockUser.googleId,
      true
    );
  });

  it("returns user when found by Google ID", async () => {
    (mockUserModel.findUserByGoogleId as Mock).mockResolvedValueOnce(mockUser);

    await expect(
      userService.findUserByGoogleId(mockUser.googleId, true)
    ).resolves.toBe(mockUser);
    expect(mockUserModel.findUserByGoogleId).toHaveBeenCalledWith(
      mockUser.googleId,
      true
    );
  });
});

describe("UserService - findUserByEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws UserNotFoundError if user not found by email", async () => {
    (mockUserModel.findUserByEmail as Mock).mockResolvedValueOnce(undefined);

    await expect(userService.findUserByEmail(mockUser.email)).rejects.toThrow(
      UserError.UserNotFoundError
    );
    expect(mockUserModel.findUserByEmail).toHaveBeenCalledWith(
      mockUser.email,
      false
    );
  });

  it("returns user when found by email", async () => {
    (mockUserModel.findUserByEmail as Mock).mockResolvedValueOnce(mockUser);

    await expect(userService.findUserByEmail(mockUser.email)).resolves.toBe(
      mockUser
    );
    expect(mockUserModel.findUserByEmail).toHaveBeenCalledWith(
      mockUser.email,
      false
    );
  });
});

describe("UserService - registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws DuplicatedUserEmailError if email already exists", async () => {
    (mockUserModel.findUserByEmail as Mock).mockResolvedValueOnce({
      ...mockUser,
      name: "Other User",
    });

    await expect(userService.registerUser(mockUser)).rejects.toThrow(
      UserError.DuplicatedUserEmailError
    );
    expect(mockUserModel.findUserByEmail).toHaveBeenCalledWith(mockUser.email);
  });
});
