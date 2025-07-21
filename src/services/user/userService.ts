import {
  getUserById,
  getUserByEmail,
  createUser,
  changeUser2faSecretByUserId,
  get2faSecretByUserId,
  enable2faByUserId,
} from "models/userModel.js";
import * as UserError from "./userError.js";
import { CreateUserDto } from "dtos/user.dto.js";
import bcrypt from "bcryptjs";

export const findUserById = async (userId: number) => {
  const user = await getUserById(userId);
  if (!user) throw new UserError.UserNotFoundError();
  return user;
};

export const findUserByEmail = async (email: string) => {
  const user = await getUserByEmail(email);
  if (!user) throw new UserError.UserNotFoundError();
  return user;
};

export const registerUser = async (userData: CreateUserDto) => {
  const userWithSameEmail = await getUserByEmail(userData.email);
  if (userWithSameEmail) throw new UserError.DuplicatedUserEmailError();
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const userToCreate = { ...userData, password: hashedPassword };
  return await createUser(userToCreate);
};

export const change2faSecret = async (
  userId: number,
  encryptedSecret: string
) => {
  return await changeUser2faSecretByUserId(userId, encryptedSecret);
};

export const get2faSecret = async (userId: number) => {
  const secret = await get2faSecretByUserId(userId);
  if (!secret) throw new UserError.SecretNotFoundError();
  return secret;
};

export const enable2fa = async (userId: number) => {
  return await enable2faByUserId(userId);
};
