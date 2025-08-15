import "dotenv/config";
import { describe, beforeAll, afterAll, it, expect } from "vitest";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { startApp } from "start.js";
import request from "supertest";
import express, { Application } from "express";
import { Wait } from "testcontainers";
import http from "http";
import https from "https";
import { users } from "db/schema.js";
import { waitForDb, getConnectionUrlFromContainer } from "utils/tests.js";
import { CreateTask, UpdateTask } from "dtos/task.dto.js";
import { UserPublic, CreateUser } from "dtos/user.dto.js";

let container: StartedPostgreSqlContainer;
let pool: pg.Pool;
let app: Application;
let server:
  | ReturnType<typeof http.createServer>
  | ReturnType<typeof https.createServer>;
let agent: ReturnType<typeof request.agent>;

const testUser = {
  "2faEnabled": false,
  email: "user_test@mail.com",
  name: "User Test",
  password: "123",
};

let userPublicData: UserPublic;

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

  const environment = process.env.NODE_ENV;
  await waitForDb(
    pool,
    environment === "gh-server" ? 60 : 30,
    environment === "gh-server" ? 3000 : 2000
  );

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

  agent = request.agent(app); // simulate a client with session (browser)
}, 90_000);

afterAll(async () => {
  await pool.end();
  await container.stop();
  server.close();
});

describe("Tasks Module - User Workflow", () => {
  let taskId1: number, taskId2: number;
  it("should log the user in", async () => {
    const authHeader = ["Authorization", "access_token_with_bearer"];
    const res = await agent
      .post("/api/v1/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);
    expect(res.body).toHaveProperty("accessToken");
    authHeader[1] = `Bearer ${res.body.accessToken}`;
    agent.set(...authHeader);
  });

  it("should get user public data", async () => {
    const { body: userData }: { body: UserPublic } = await agent
      .get("/api/v1/user")
      .expect(200);
    expect(userData).toBeDefined();
    userPublicData = userData;
  });

  it("should create a task", async () => {
    const { body } = await agent
      .post("/api/v1/task")
      .send({
        title: "Test Task",
        isDone: true,
        description: "This is a task created for test purpose.",
      } as CreateTask)
      .expect(201);
    taskId1 = body.id;
  });

  it("should create another task", async () => {
    const { body } = await agent
      .post("/api/v1/task")
      .send({
        title: "Test Task 2",
        isDone: true,
        description: "This is the second task created for test purpose.",
      } as CreateTask)
      .expect(201);
    taskId2 = body.id;
  });

  it("should list all tasks", async () => {
    const { body } = await agent.get("/api/v1/task").expect(200);
    expect(body).toHaveLength(2);
  });

  it("should update the first task as a whole", async () => {
    const { body } = await agent
      .put(`/api/v1/task/${taskId1}`)
      .send({
        description: "This is another description",
        title: "This is another title",
        dueDate: "2025-12-30",
      } as UpdateTask)
      .expect(200);
    expect(body).toBeDefined();
  });

  it("should update the status of the second task", async () => {
    await agent
      .patch(`/api/v1/task/${taskId2}`)
      .send({
        isDone: true,
      })
      .expect(204);
  });

  it("should remove the first task", async () => {
    await agent.delete(`/api/v1/task/${taskId1}`).expect(204);
  });

  it("should list all tasks (now retuning just 1)", async () => {
    const { body } = await agent.get("/api/v1/task").expect(200);
    expect(body).toHaveLength(1);
  });
});

describe("GET /api/v1/task ", () => {
  it("should return 401 if not authenticated", async () => {
    await request(app).get("/api/v1/task").expect(401);
  });

  it("should list all if is authenticated", async () => {
    await agent
      .get("/api/v1/task")
      .expect(200)
      .expect((res) => expect(res.body).toBeDefined());
  });
});
