import "dotenv/config";
import { describe, it, expect, Mock, beforeAll, afterAll } from "vitest";
import request from "supertest";

describe("Task CRUD workflow", () => {
  const userTest = {
    name: "User Test",
    email: "test@mail.com",
    password: "TEST_PASS",
    "2faEnabled": false,
  };
});
