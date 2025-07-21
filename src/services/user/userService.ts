import * as UserModel from "models/userModel.js";
import * as UserError from "./userError.js";
import { CreateUserDto } from "dtos/user.dto.js";
import bcrypt from "bcryptjs";

export const findUserById = async (userId: number) => {
  const user = await UserModel.getUserById(userId);
  if (!user) throw new UserError.UserNotFoundError();
  return user;
};

export const findUserByEmail = async (email: string) => {
  const user = await UserModel.getUserByEmail(email);
  if (!user) throw new UserError.UserNotFoundError();
  return user;
};

export const registerUser = async (userData: CreateUserDto) => {
  const userWithSameEmail = await UserModel.getUserByEmail(userData.email);
  if (userWithSameEmail) throw new UserError.DuplicatedUserEmailError();
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const userToCreate = { ...userData, password: hashedPassword };
  return await UserModel.createUser(userToCreate);
};

export const change2faSecret = async (
  userId: number,
  encryptedSecret: string
) => {
  return await UserModel.changeUser2faSecretByUserId(userId, encryptedSecret);
};

export const get2faSecret = async (userId: number) => {
  const secret = await UserModel.get2faSecretByUserId(userId);
  if (!secret) throw new UserError.SecretNotFoundError();
  return secret;
};

export const enable2fa = async (userId: number) => {
  return await UserModel.enable2faByUserId(userId);
};
