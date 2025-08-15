import * as UserError from "./userError.js";
import * as UserDto from "dtos/user.dto.js";
import bcrypt from "bcryptjs";

export function createUserService(
  userModel: ReturnType<typeof import("models/userModel.js").createUserModel>
) {
  async function findUserById(
    userId: number,
    showPrivateFields: boolean = false
  ) {
    const user = await userModel.findUserById(userId, showPrivateFields);
    if (!user) throw new UserError.UserNotFoundError();
    return user;
  }

  async function findUserByGoogleId(
    googleId: string,
    showPrivateFields: boolean = false
  ) {
    const user = await userModel.findUserByGoogleId(
      googleId,
      showPrivateFields
    );
    if (!user) throw new UserError.UserNotFoundError();
    return user;
  }

  async function findUserByEmail(
    email: string,
    showPrivateFields: boolean = false
  ): Promise<UserDto.UserPrivate | UserDto.UserPublic> {
    const user = await userModel.findUserByEmail(email, showPrivateFields);
    if (!user) throw new UserError.UserNotFoundError();
    return user;
  }

  async function registerUser(
    userData: UserDto.CreateUser,
    registerMode: "internal" | "google" = "internal"
  ) {
    const userWithSameEmail = await userModel.findUserByEmail(userData.email);
    if (userWithSameEmail) throw new UserError.DuplicatedUserEmailError();

    let userToCreate = { ...userData };
    if (registerMode === "internal") {
      const hashedPassword = await bcrypt.hash(userData.password!, 10);
      userToCreate = { ...userData, password: hashedPassword };
    }
    return await userModel.insertUser(userToCreate);
  }

  async function change2faSecret(userId: number, encryptedSecret: string) {
    return await userModel.update2faSecretByUserId(userId, encryptedSecret);
  }

  async function find2faSecretByUserId(userId: number) {
    const secret = await userModel.find2faSecretByUserId(userId);
    if (!secret) throw new UserError.SecretNotFoundError();
    return secret;
  }

  async function enable2faByUserId(userId: number) {
    return await userModel.update2faByUserId(userId, "enable");
  }

  async function disable2faByUserId(userId: number) {
    return await userModel.update2faByUserId(userId, "disable");
  }

  return {
    findUserById,
    findUserByGoogleId,
    findUserByEmail,
    registerUser,
    change2faSecret,
    find2faSecretByUserId,
    enable2faByUserId,
    disable2faByUserId,
  };
}
