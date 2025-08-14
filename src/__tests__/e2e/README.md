# Backend Testing Guide

This document explains our **testing strategy** for the backend repository, our test categories, and when/where each should be run.

## 📌 Overview

Since this repo contains **only the backend**, our **day-to-day testing** happens here locally (unit + integration tests).  
**Full E2E tests** that involve the frontend will run in a **shared/staging environment** where both frontend and backend are deployed together.

---

## 🧪 Types of Tests

### 1. Unit Tests
**Definition:**  
Tests that focus on **a single function, class, or small piece of code** in isolation from the rest of the system.

**Goal:**  
Verify correctness of small, isolated logic.

**Characteristics:**
- No database, server, or external API calls — all dependencies are **mocked or stubbed**.
- Run **very fast**.
- High number of them — they are our "safety net" against regressions.
- Examples:  
  - A utility function that formats a date.  
  - A service method that calculates a business rule.

**When/Where:**
- Run **locally on every change**.
- Run automatically in CI on every commit/PR.

---

### 2. Integration Tests
**Definition:**  
Tests that verify **multiple modules/components of the backend working together**, testing their integration points.

**Goal:**  
Confirm that our backend modules (controllers, services, models) talk to each other and to real dependencies (e.g., DB) correctly.

**Characteristics:**
- Real database (can be local, in-memory DB, or containerized DB via Testcontainers/Docker).
- Tests **HTTP endpoints** (via Supertest or similar) and full request → response logic **inside the backend**.
- Does **not** require frontend — it hits API endpoints directly.
- Examples:  
  - Testing `/api/users` endpoint with real DB insert/query.  
  - Verifying a task creation flow stores data in DB.

**When/Where:**
- Run **locally during development**.
- Run in CI/CD pipelines for every backend commit.

---

### 3. End-to-End (E2E) Tests
**Definition:**  
Tests that validate **the entire real system flow** as close to production as possible, covering frontend → backend → database → external services.

**Goal:**  
Verify that from a **user’s point of view**, the whole workflow works as expected.

**Characteristics:**
- Requires both frontend and backend running together (often in staging or a test deployment).
- Uses real services and infrastructure — minimal mocking.
- Examples:  
  - User registers via frontend → API call to backend → user appears in DB.
  - Creating an order from UI and verifying it appears in admin panel.

**When/Where:**
- **Not run locally** (backend repo alone doesn’t have the frontend).
- Run in **shared/staging** environments where both frontend and backend are deployed.
- Often triggered by CI/CD after both repos are built/deployed.

---

## 🚦 Our Workflow

### Local Development (Backend Repo)
1. **Unit Tests:**  
   - Fast feedback on local code.  
   - Run with `npm test` (or equivalent).

2. **Integration Tests:**  
   - Validate backend endpoints and DB logic.  
   - Use containerized DB (via Testcontainers) or local DB.  
   - Run before pushing code.

### Shared/Staging Environment
- **E2E Tests:**  
  - Require both frontend and backend.  
  - Run in CI/CD or staging environment after deployment.  
  - Validates full user workflows before production.

---

## 💡 Why This Separation?
- Keeps local dev **fast** and feedback loop short.
- Ensures backend code is correct before spending time testing with frontend.
- Shared E2E runs catch **cross-system issues** that unit/integration tests can’t.

---