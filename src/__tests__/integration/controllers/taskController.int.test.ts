import "dotenv/config";
import { describe, beforeAll, afterAll, it, expect } from "vitest";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { startApp } from "start.js";
import supertest from "supertest";
import express, { Application } from "express";
import { Wait } from "testcontainers";
import http from "http";
import https from "https";
import { users } from "db/schema.js";
import { waitForDb, getConnectionUrlFromContainer } from "utils/tests.js";

let container: StartedPostgreSqlContainer;
let pool: pg.Pool;
let app: Application;
let server:
  | ReturnType<typeof http.createServer>
  | ReturnType<typeof https.createServer>;
let agent: ReturnType<typeof supertest.agent>;

const testUser = {
  "2faEnabled": false,
  email: "user_test@mail.com",
  name: "User Test",
  password: "123",
};

beforeAll(async () => {
  const tag = process.env.POSTGRES_VERSION_TAG;
  container = await new PostgreSqlContainer(`postgres:${tag}`)
    .withWaitStrategy(
      Wait.forLogMessage("database system is ready to accept connections")
    )
    .withDatabase("test_db")
    .withUsername("user")
    .withPassword("pass")
    .start();

  process.env.DATABASE_URL = getConnectionUrlFromContainer(container);

  const { pool: p, db } = await import("db/connection.js");
  pool = p;

  await waitForDb(pool);

  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    // console.log("Migration completed.");
  } catch (err) {
    console.error("Failed to migrate", err);
  }

  await db.delete(users);

  const { app: a, server: s } = startApp(express());
  app = a;
  server = s;

  const { registerUser } = await import("services/user/userService.js");
  try {
    const user = await registerUser(testUser);
    // console.log("Test user registered", user);
  } catch (err) {
    console.error("Failed to register test user", err);
  }

  agent = supertest.agent(app); // simulate a client with session (browser)
  
}, 90_000);

afterAll(async () => {
  await pool.end();
  await container.stop();
  server.close();
});

describe("Tasks API (CRUD workflow)", () => {
  it("should log the user in", async () => {
    const res = await agent
      .post("/api/v1/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);
    expect(res.body).toHaveProperty("accessToken");
  });
});
