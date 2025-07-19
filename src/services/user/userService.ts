import { getUserByEmail, createUser } from "models/userModel.js";
import * as UserError from "./userError.js";
import { CreateUserDto } from "dtos/user.dto.js";
import bcrypt from "bcryptjs";

export const findUserByEmail = async (email: string) => {
    const user = await getUserByEmail(email);
    if (!user) throw new UserError.UserNotFoundError();
    return user;
}

export const registerUser = async (userData: CreateUserDto) => {
    const userWithSameEmail = await getUserByEmail(userData.email);
    if (userWithSameEmail) throw new UserError.DuplicatedUserEmailError();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userToCreate = { ...userData, password: hashedPassword };
    return await createUser(userToCreate);
}