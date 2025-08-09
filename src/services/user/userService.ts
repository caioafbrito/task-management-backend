import * as UserModel from "models/userModel.js";
import * as UserError from "./userError.js";
import * as UserDto from "dtos/user.dto.js";
import bcrypt from "bcryptjs";

export const findUserById = async (
  userId: number,
  showPrivateFields: boolean = false
) => {
  const user = await UserModel.findUserById(userId, showPrivateFields);
  if (!user) throw new UserError.UserNotFoundError();
  return user;
};

export const findUserByGoogleId = async (
  googleId: string,
  showPrivateFields: boolean = false
) => {
  const user = await UserModel.findUserByGoogleId(googleId, showPrivateFields);
  if (!user) throw new UserError.UserNotFoundError();
  return user;
};

export async function findUserByEmail(
  email: string,
  showPrivateFields: boolean = false
): Promise<UserDto.UserPrivate | UserDto.UserPublic> {
  const user = await UserModel.findUserByEmail(email, showPrivateFields);
  if (!user) throw new UserError.UserNotFoundError();
  return user;
}

export const registerUser = async (
  userData: UserDto.CreateUser,
  registerMode: "internal" | "google" = "internal"
) => {
  const userWithSameEmail = await UserModel.findUserByEmail(userData.email);
  if (userWithSameEmail) throw new UserError.DuplicatedUserEmailError();
  let userToCreate = { ...userData };
  if (registerMode === "internal") {
    const hashedPassword = await bcrypt.hash(userData.password!, 10);
    userToCreate = { ...userData, password: hashedPassword };
  }
  return await UserModel.insertUser(userToCreate);
};

export const change2faSecret = async (
  userId: number,
  encryptedSecret: string
) => {
  return await UserModel.update2faSecretByUserId(userId, encryptedSecret);
};

export const find2faSecretByUserId = async (userId: number) => {
  const secret = await UserModel.find2faSecretByUserId(userId);
  if (!secret) throw new UserError.SecretNotFoundError();
  return secret;
};

export const enable2faByUserId = async (userId: number) => {
  return await UserModel.update2faByUserId(userId, "enable");
};

export const disable2faByUserId = async (userId: number) => {
  return await UserModel.update2faByUserId(userId, "disable");
};
