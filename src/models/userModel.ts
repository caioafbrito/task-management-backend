import { db } from "db/connection.js";
import { users } from "db/schema.js";
import { eq } from "drizzle-orm";
import type { CreateUser, UserPublic, UserPrivate } from "dtos/user.dto.js";

const publicFields = {
  id: users.id,
  name: users.name,
  email: users.email,
  "2faEnabled": users["2faEnabled"],
  age: users.age,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

const privateFields = {
  ...publicFields,
  password: users.password,
};

export async function findUserById(
  id: number,
  showPrivateFields: boolean = false
) {
  const [user] = await db
    .select(showPrivateFields ? privateFields : publicFields)
    .from(users)
    .where(eq(users.id, id));
  if (showPrivateFields) {
    return user as UserPrivate | undefined;
  } else {
    return user as UserPublic | undefined;
  }
}

export async function findUserByGoogleId(
  googleId: string,
  showPrivateFields: boolean = false
) {
  const [user] = await db
    .select(showPrivateFields ? privateFields : publicFields)
    .from(users)
    .where(eq(users.googleId, googleId));
  if (showPrivateFields) {
    return user as UserPrivate | undefined;
  } else {
    return user as UserPublic | undefined;
  }
}

export async function findUserByEmail(
  email: string,
  showPrivateFields: boolean = false
) {
  const [user] = await db
    .select(showPrivateFields ? privateFields : publicFields)
    .from(users)
    .where(eq(users.email, email));
  if (showPrivateFields) {
    return user as UserPrivate | undefined;
  } else {
    return user as UserPublic | undefined;
  }
}

export const insertUser = async (userData: CreateUser) => {
  const [user] = await db
    .insert(users)
    .values(userData)
    .returning(publicFields);
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
    .set({ "2faEnabled": action === "enable" })
    .where(eq(users.id, userId));
};
