import { getUserByEmail } from "models/userModel.js";
import * as UserError from "./userError.js";

export const findUserByEmail = async (email: string) => {
    const user = await getUserByEmail(email);
    if (!user) throw new UserError.UserNotFoundError();
    return user;
}