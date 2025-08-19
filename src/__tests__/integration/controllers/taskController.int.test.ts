import "dotenv/config";
import { describe, beforeAll, afterAll, it, expect } from "vitest";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { waitForDb } from "utils/tests.js";
import request from "supertest";
import express from "express";
import { Wait } from "testcontainers";
import http from "http";
import https from "https";
import { factory } from "../../../factory.js";
import { users } from "db/schema.js";
import { CreateTask, UpdateTask } from "dtos/task.dto.js";
import type { UserPublic } from "dtos/user.dto.js";

let container: StartedPostgreSqlContainer;
let pool: pg.Pool;
let app: express.Application;
let server:
  | ReturnType<typeof http.createServer>
  | ReturnType<typeof https.createServer>;
let agent: ReturnType<typeof request.agent>;

const testUser = {
  name: "User Test",
  email: "user_test@mail.com",
  password: "123",
  "2faEnabled": false,
};

let userPublicData: UserPublic;

const attempts = Number(process.env.DB_RETRY_ATTEMPTS || 5);
const delayMs = Number(process.env.DB_RETRY_DELAY_MS || 1000);
const maxWaitMs = attempts * delayMs;

beforeAll(async () => {
  const tag = process.env.POSTGRES_VERSION_TAG || "15-alpine";
  container = await new PostgreSqlContainer(`postgres:${tag}`)
    .withUsername("user")
    .withPassword("pass")
    .withDatabase("test_db")
    .withExposedPorts(5432)
    .withWaitStrategy(
      Wait.forLogMessage("database system is ready to accept connections")
    )
    .start();

  process.env.DATABASE_URL = container.getConnectionUri();
  console.log(process.env.DATABASE_URL);

  const { pool: p, db } = await import("db/connection.js").then((m) =>
    m.getDb(process.env.DATABASE_URL)
  );
  pool = p;

  await waitForDb(pool, attempts, delayMs);

  try {
    await migrate(db, { migrationsFolder: "drizzle" });
  } catch (err) {
    console.error("Migration failed:", err);
  }

  await db.delete(users);

  const { startApp } = await import("../../../start.js");
  const appInit = startApp(express());
  app = appInit.app;
  server = appInit.server;

  const { userService } = factory.services;
  try {
    await userService.registerUser(testUser);
  } catch (err) {
    console.error("Could not create test user:", err);
  }

  agent = request.agent(app);
}, maxWaitMs + 30000);

afterAll(async () => {
  await pool.end();
  await container.stop();
  server.close();
});

describe("Tasks Module - User Workflow", () => {
  let taskId1: number;
  let taskId2: number;

  it("logs in user and stores auth token", async () => {
    const res = await agent
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(res.body).toHaveProperty("accessToken");

    agent.set("Authorization", `Bearer ${res.body.accessToken}`);
  });

  it("fetches user public data", async () => {
    const res = await agent.get("/api/v1/user").expect(200);
    const data = res.body as UserPublic;
    expect(data).toBeDefined();
    userPublicData = data;
  });

  it("creates first task", async () => {
    const { body } = await agent
      .post("/api/v1/task")
      .send({
        title: "Task One",
        description: "First Task",
        isDone: true,
      } as CreateTask)
      .expect(201);

    expect(body).toHaveProperty("id");
    taskId1 = body.id;
  });

  it("creates second task", async () => {
    const { body } = await agent
      .post("/api/v1/task")
      .send({
        title: "Task Two",
        description: "Second Task",
        isDone: true,
      } as CreateTask)
      .expect(201);

    expect(body).toHaveProperty("id");
    taskId2 = body.id;
  });

  it("lists all tasks", async () => {
    const res = await agent.get("/api/v1/task").expect(200);
    expect(res.body).toHaveLength(2);
  });

  it("updates first task fully", async () => {
    const { body } = await agent
      .put(`/api/v1/task/${taskId1}`)
      .send({
        title: "Updated Task One",
        description: "Updated Desc",
        dueDate: "2025-12-30",
      } as UpdateTask)
      .expect(200);

    expect(body).toBeDefined();
  });

  it("updates second task status", async () => {
    await agent
      .patch(`/api/v1/task/${taskId2}`)
      .send({ isDone: false })
      .expect(204);
  });

  it("deletes first task", async () => {
    await agent.delete(`/api/v1/task/${taskId1}`).expect(204);
  });

  it("lists remaining tasks", async () => {
    const res = await agent.get("/api/v1/task").expect(200);
    expect(res.body).toHaveLength(1);
  });
});

describe("Unauthenticated access", () => {
  it("rejects unauthenticated task list", async () => {
    await request(app).get("/api/v1/task").expect(401);
  });

  it("allows authenticated task list", async () => {
    await agent.get("/api/v1/task").expect(200);
  });
});
