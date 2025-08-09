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
});
