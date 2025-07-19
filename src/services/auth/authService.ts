import { findUserByEmail } from "../user/userService.js";
import * as AuthError from "./authError.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import type { AuthenticateUserDto } from "dtos/user.dto.js";

export const loginUser = async (authData: AuthenticateUserDto) => {
    const {email, password} = authData;
    const { password: hashedPass, id: userId } = await findUserByEmail(email);

    const isPassCorrect = await bcrypt.compare(password, hashedPass);
    if (!isPassCorrect) throw new AuthError.InvalidCredentialsError();

    const accessToken = jwt.sign(
        { userId },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: '10m' }
    );

    const refreshToken = jwt.sign(
        { userId },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: '7d' }
    );

    return {
        accessToken,
        refreshToken
    }
}