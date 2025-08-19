import { getDb } from "db/connection.js";
import { users } from "db/schema.js";
import { eq } from "drizzle-orm";
import type { CreateUser, UserPublic, UserPrivate } from "dtos/user.dto.js";

export function createUserModel(dbInstance = getDb().db) {
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

  async function findUserById(id: number, showPrivateFields: boolean = false) {
    const [user] = await dbInstance
      .select(showPrivateFields ? privateFields : publicFields)
      .from(users)
      .where(eq(users.id, id));
    if (showPrivateFields) {
      return user as UserPrivate | undefined;
    } else {
      return user as UserPublic | undefined;
    }
  }

  async function findUserByGoogleId(
    googleId: string,
    showPrivateFields: boolean = false
  ) {
    const [user] = await dbInstance
      .select(showPrivateFields ? privateFields : publicFields)
      .from(users)
      .where(eq(users.googleId, googleId));
    if (showPrivateFields) {
      return user as UserPrivate | undefined;
    } else {
      return user as UserPublic | undefined;
    }
  }

  async function findUserByEmail(
    email: string,
    showPrivateFields: boolean = false
  ) {
    const [user] = await dbInstance
      .select(showPrivateFields ? privateFields : publicFields)
      .from(users)
      .where(eq(users.email, email));
    if (showPrivateFields) {
      return user as UserPrivate | undefined;
    } else {
      return user as UserPublic | undefined;
    }
  }

  const insertUser = async (userData: CreateUser) => {
    const [user] = await dbInstance
      .insert(users)
      .values(userData)
      .returning(publicFields);
    return user;
  };

  const update2faSecretByUserId = async (
    userId: number,
    encryptedSecret: string
  ) => {
    return await dbInstance
      .update(users)
      .set({ "2faSecret": encryptedSecret })
      .where(eq(users.id, userId));
  };

  const find2faSecretByUserId = async (userId: number) => {
    const result = await dbInstance
      .select({
        "2faSecret": users["2faSecret"],
      })
      .from(users)
      .where(eq(users.id, userId));
    return result[0]["2faSecret"];
  };

  const update2faByUserId = async (
    userId: number,
    action: "enable" | "disable"
  ) => {
    return await dbInstance
      .update(users)
      .set({ "2faEnabled": action === "enable" })
      .where(eq(users.id, userId));
  };

  return {
    findUserById,
    findUserByGoogleId,
    findUserByEmail,
    insertUser,
    update2faSecretByUserId,
    find2faSecretByUserId,
    update2faByUserId,
  };
}
