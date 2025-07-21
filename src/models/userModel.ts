import db from "../db/connection.js";
import { users } from "db/schema.js";
import { eq } from "drizzle-orm";
import type { CreateUserDto } from "dtos/user.dto.js";

export const findUserById = async (id: number) => {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
};

export const findUserByEmail = async (email: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
};

export const createUser = async (userData: CreateUserDto) => {
  const [user] = await db
    .insert(users)
    .values(userData)
    .returning({ userId: users.id, userName: users.name });
  return user;
};

export const update2faSecretByUserId = async (
  userId: number,
  encryptedSecret: string
) => {
  return await db
    .update(users)
    .set({ "2faSecret": encryptedSecret })
    .where(eq(users.id, userId));
};

export const find2faSecretByUserId = async (userId: number) => {
  const result = await db
    .select({
      "2faSecret": users["2faSecret"],
    })
    .from(users)
    .where(eq(users.id, userId));
  return result[0]["2faSecret"];
};

export const update2faByUserId = async (
  userId: number,
  action: "enable" | "disable"
) => {
  return await db
    .update(users)
    .set({ "2faEnabled": true })
    .where(eq(users.id, userId));
};
