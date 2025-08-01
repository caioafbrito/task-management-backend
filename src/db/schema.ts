import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
  date,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  googleId: text("google_id").default(""),
  name: varchar("name", { length: 255 }).notNull(),
  age: integer("age"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password"),
  "2faEnabled": boolean("2fa_enabled").notNull().default(false),
  "2faSecret": text("2fa_secret"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: date("due_date", { mode: "string" }),
  isDone: boolean("is_done").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  owner: integer("owner")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
}));
