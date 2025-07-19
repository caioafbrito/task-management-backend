import db from "../db/connection.js";
import { users } from "db/schema.js";
import { eq } from "drizzle-orm";

export const getUserById = async (id: number) => {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id));
    return user;
}

export const getUserByEmail = async (email: string) => {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
    return user;
}