## Oasis
**For those who thirst for knowledge**


## Overview

**OASIS** is a digital learning platform designed for **rural and low-connectivity regions**, where network access is often **slow, intermittent, or unreliable**.

Our core challenge was to balance:

* ⚡ Fast load times on poor networks
* 📚 Fresh educational content (announcements, lessons)
* 📶 Minimal repeated network usage
* 💰 Low server and bandwidth costs

We evaluated **static rendering**, **dynamic (server-side) rendering**, and **hybrid rendering** using **Next.js App Router data fetching** features such as `cache`, `revalidate`, and `dynamic`.

This document explains the trade-offs and the final rendering architecture used in OASIS.

---

## Rendering Strategies: Trade-offs

### 1️⃣ Static Rendering (SSG)

**How it works**

* Pages are generated at build time
* Served from a CDN
* No server computation per request

**Pros**

* Extremely fast on slow networks
* Works reliably even with unstable connections
* Minimal bandwidth usage
* Very low hosting cost

**Cons**

* Content does not update in real time
* Requires rebuild or revalidation for changes

**OASIS Impact**

* Platform loads quickly even on 2G/3G networks
* Core learning material remains accessible
* Some announcements became outdated if not refreshed

**Best Use Cases in OASIS**

* Course landing pages
* Lesson content
* Help guides and offline-friendly resources

---

### 2️⃣ Dynamic Rendering (SSR)

**How it works**

* Page is rendered on every request
* Always fetches the latest data from the server

**Pros**

* Always fresh content
* Ideal for personalized data

**Cons**

* Slower on poor networks
* Requires constant server access
* High data and hosting cost
* Risky for unreliable connectivity

**OASIS Impact**

* Live updates worked
* Page loads failed or stalled in low-network regions
* Increased server load and operational cost

**Best Use Cases in OASIS**

* Student dashboards
* Progress tracking
* Authentication-based pages

---

### 3️⃣ Hybrid Rendering (Recommended)

**How it works**

* Static page shell for reliability
* Incrementally updated data using revalidation
* Dynamic rendering only where absolutely required

**Pros**

* Fast initial load
* Reduced network dependency
* Controlled data freshness
* Lower server and bandwidth costs

**Cons**

* Requires intentional design decisions

**OASIS Impact**

* Platform works reliably in rural areas
* Learning content stays accessible
* Updates propagate without full rebuilds

---

## Next.js App Router Implementation

### 🔹 Static Pages (Learning Content)

```js
export const dynamic = "force-static";
```

Used for:

* Lesson pages
* Course outlines
* Reading material

**Why**

* Learners can load content quickly
* Pages remain usable even with unstable connectivity

---

### 🔹 Incrementally Updated Content (Announcements & Schedules)

```js
fetch("https://api.oasis.org/announcements", {
  next: { revalidate: 3600 }
});
```

**Why**

* Updates every hour
* Prevents frequent network calls
* Ensures announcements are not stale for long periods

---

### 🔹 Fully Dynamic Pages (Student Dashboard)

```js
export const dynamic = "force-dynamic";
```

Used for:

* Student progress
* Enrollments
* Personalized recommendations

**Why**

* Data is user-specific
* Must always be accurate

---

## Page-by-Page Rendering Strategy

| Page Type         | Rendering Mode      | Reason                       |
| ----------------- | ------------------- | ---------------------------- |
| Homepage          | Static + Revalidate | Fast access, minimal updates |
| Course Pages      | Static              | Offline-friendly learning    |
| Announcements     | ISR (1 hr)          | Periodic freshness           |
| Student Dashboard | Dynamic             | Personalized data            |
| Course Catalog    | ISR (6–12 hrs)      | Stable but evolving content  |

---

## Final Architecture Decision

OASIS uses a **hybrid rendering strategy** optimized for **low-connectivity environments**:

* **Static rendering** for reliability and speed
* **Incremental revalidation** for controlled freshness
* **Dynamic rendering** only for essential user-specific data

This approach ensures:

* 📶 Accessibility in rural areas
* ⚡ Fast loading on weak networks
* 💰 Reduced server and bandwidth costs
* 📚 Consistent learning experience

---

## 🔐 Environment-Aware Builds & Secure Secrets Management

## Why Environment Segregation Is Essential in Modern Deployments

Modern applications run in **multiple environments**—typically **development**, **staging**, and **production**—each serving a distinct purpose. Environment segregation ensures that code, configuration, and data **do not interfere with each other**, reducing the risk of catastrophic failures.

### In Our Project (Next.js + Docker + PostgreSQL + Redis)

We use environment segregation to ensure:

* **Development**

  * Local database
  * Debug logs enabled
  * Safe experimentation

* **Staging**

  * Production-like setup
  * Test data only
  * Used for final validation before release

* **Production**

  * Real user data
  * Locked-down credentials
  * Strict access controls

Each environment has **separate configuration and secrets**, even though the **codebase remains the same**.

---

## What Went Wrong in the ShopLite Case Study

### Incident Summary

A developer mistakenly used **staging database credentials in production**, which caused:

* Overwriting of live product data
* Downtime during rollback
* Loss of customer trust during a high-traffic sale

### Root Causes

1. ❌ **No strict environment segregation**
2. ❌ **Secrets were manually copied**
3. ❌ **Production accepted non-production credentials**
4. ❌ **CI/CD pipeline did not validate environment context**

---

## How Environment Segregation Prevents This

### 1. Separate Environment Configuration Files

In our project, each environment has its own configuration:

```bash
.env.development
.env.staging
.env.production
```

Example:

```env
# .env.development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/devdb
```

```env
# .env.production
DATABASE_URL=${DATABASE_URL_FROM_SECRET_MANAGER}
```

🚫 **Production secrets are never stored locally or committed**

---

### 2. Environment-Aware Builds

Our Docker and Next.js setup relies on **environment variables injected at runtime**, not hardcoded values.

Example (docker-compose):

```yaml
environment:
  DATABASE_URL: ${DATABASE_URL}
```

This ensures:

* The same image runs everywhere
* Behavior changes only via environment variables
* No chance of staging config leaking into production

---

## How Secure Secret Management Improves CI/CD Safety

### Problems With Plain `.env` Files

* Easy to commit accidentally
* Hard to rotate credentials
* Visible in logs if misconfigured

---

### Secure Approach Used

Instead of committing secrets, we use **secret managers**, such as:

* **GitHub Secrets** (CI/CD)
* **AWS Parameter Store / Azure Key Vault** (Production)

#### Example: GitHub Actions

```yaml
env:
  DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
```

✔ Secrets are:

* Encrypted at rest
* Masked in logs
* Scoped per environment (dev/staging/prod)

---

## How This Would Have Prevented the ShopLite Incident

| Problem                       | Prevention                 |
| ----------------------------- | -------------------------- |
| Staging DB used in production | Separate prod-only secrets |
| Manual credential copy        | Automated secret injection |
| No environment checks         | CI/CD environment gates    |
| Secrets in files              | Central secret manager     |

With proper segregation:

* Production would **never have access** to staging credentials
* CI/CD would fail if the wrong environment secret is missing
* Rollback wouldn’t be needed because the failure wouldn’t occur

---

## Summary

Environment-aware builds and secure secrets management are **not optional** in modern deployments.

They provide:

* 🔒 Data safety
* 🚀 Reliable deployments
* 🛡️ Protection against human error
* 📦 Reusable, environment-agnostic builds

The ShopLite failure was not a code issue—it was a **configuration and secret isolation failure**, which our project architecture explicitly avoids.

## Cloud Deployments 101: Docker → CI/CD → AWS/Azure

## Understanding Cloud Deployments

### Objective
The goal of this exploration is to understand how a full-stack application can be taken from a local development environment to the cloud using **Docker**, **CI/CD pipelines**, and **cloud platforms like AWS or Azure**. This includes learning how automation improves reliability, how deployments are managed securely, and how common deployment failures can be avoided.

---

## Docker: Containerizing the Application

Docker packages the app plus runtime and dependencies into a portable container, ensuring consistency across dev, test, and prod.

**Key concepts**
* Dockerfile defines the image build
* Docker image is the immutable blueprint
* Docker container is a running instance
* Eliminates “works on my machine” issues

**Example Dockerfile**

```dockerfile
FROM node:18
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Same environment runs locally, in CI/CD, and in the cloud.

---

## CI/CD: Automating Build → Test → Deploy

CI/CD (Continuous Integration/Deployment) automates repetitive steps on every push.

**What CI/CD does**
* Builds the Docker image
* Runs tests
* Deploys if checks pass

**Example GitHub Actions workflow**

```yaml
name: CI Pipeline
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker Image
        run: docker build -t quickserve-app .
```

**Benefits**
* Faster, more reliable deployments
* Fewer manual errors
* Repeatable release process

---

## Deploying to AWS / Azure

Common landing zones once containerized:
* AWS: EC2, Elastic Beanstalk, ECS
* Azure: App Service, Container Instances

**Key deployment concepts**
* Separate environments (dev/staging/prod)
* Correct port mapping
* Health checks and restart policies
* Load balancing for scale

---

## Environment Variables & Secrets Management

Sensitive data must not be hardcoded.

**Best practices**
* Use `.env.local` for local development (never commit)
* Use `.env.example` as a template (commit this)
* Use GitHub Secrets in CI/CD
* Use AWS Parameter Store or Azure Key Vault in production

**Files in this project:**
* `.env.local` → contains actual secrets (ignored by Git)
* `.env.example` → template with placeholder values and documentation

---

## Environment Variables Reference

### Complete Environment Variables Table

| Variable Name | Scope | Required | Default | Description |
|--------------|-------|----------|---------|-------------|
| **DATABASE_URL** | Server-only | Yes | - | PostgreSQL connection string. Format: `postgresql://user:password@host:port/dbname` |
| **DATABASE_POOL_MIN** | Server-only | No | 2 | Minimum database connection pool size |
| **DATABASE_POOL_MAX** | Server-only | No | 10 | Maximum database connection pool size |
| **REDIS_URL** | Server-only | No | `redis://localhost:6379` | Redis connection URL for caching and sessions |
| **REDIS_PASSWORD** | Server-only | No | - | Redis authentication password (if required) |
| **JWT_SECRET** | Server-only | Yes | - | Secret key for JWT token signing/verification (min 32 characters) |
| **JWT_EXPIRES_IN** | Server-only | No | 86400 | JWT token expiration time in seconds (default: 24 hours) |
| **SESSION_SECRET** | Server-only | Yes | - | Secret key for session cookie encryption (min 32 characters) |
| **NODE_ENV** | Build-time & Runtime | No | `development` | Application environment: `development`, `staging`, or `production` |
| **NEXT_PUBLIC_API_URL** | Client-side (exposed) | Yes | - | API base URL accessible from browser. Must be prefixed with `NEXT_PUBLIC_` |
| **NEXT_PUBLIC_APP_VERSION** | Client-side (exposed) | No | `1.0.0` | Application version for debugging/logging |
| **PORT** | Server-only | No | 3000 | Port number for Next.js server |

### Variable Scope Explanation

**Server-only variables:**
* Accessed via `process.env` in server-side code (API routes, Server Components, Server Actions)
* **Never** exposed to the browser
* Can contain sensitive secrets (database URLs, API keys, tokens)

**Client-safe variables (NEXT_PUBLIC_ prefix):**
* Must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser
* Exposed in the client bundle — **never include secrets**
* Accessible via `process.env.NEXT_PUBLIC_*` in both server and client code
* Bundled at build time, so changing them requires a rebuild

**Build-time vs Runtime variables:**
* `NODE_ENV` is used during both build and runtime
* `NEXT_PUBLIC_*` variables are embedded at build time
* Server-only variables are read at runtime from the environment

### Setting Up Environment Variables

1. **Copy the template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in actual values in `.env.local`:**
   ```env
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/oasis_dev
   JWT_SECRET=your-actual-secret-key-here-min-32-chars
   SESSION_SECRET=your-actual-session-secret-here-min-32-chars
   ```

3. **Verify `.env.local` is in `.gitignore`:**
   ```bash
   git check-ignore .env.local
   # Should output: .env.local
   ```

---

## Build-Time vs Runtime Variable Usage

### Understanding Variable Timing

**Build-time variables:**
* Embedded into the JavaScript bundle during `next build`
* `NEXT_PUBLIC_*` variables are inlined into client code
* Changes require a rebuild to take effect
* Visible in the browser's source code (only use for non-sensitive config)

**Runtime variables:**
* Read from the environment when the server starts
* Server-only variables (without `NEXT_PUBLIC_`) are read at runtime
* Changes take effect after server restart (no rebuild needed)
* Never exposed to the client

### Example Usage in Code

**Server-side (API Route or Server Component):**
```typescript
// ✅ Safe: Server-only variable
const dbUrl = process.env.DATABASE_URL;

// ✅ Safe: Client-safe variable (can use on server too)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

**Client-side (React Component):**
```typescript
// ✅ Safe: Client-safe variable
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ❌ DANGEROUS: This will be undefined on client!
// const secret = process.env.JWT_SECRET; // undefined in browser
```

---

## Common Pitfalls & How We Avoid Them

### Pitfall 1: Accidental Secret Exposure

**Problem:**
* Adding secrets to `NEXT_PUBLIC_*` variables exposes them in the browser
* Committing `.env.local` to Git leaks production secrets

**How we avoided it:**
* ✅ Strict `.gitignore` rules (`.env.local`, `.env*.local`)
* ✅ Documented scope in `.env.example` (clearly marked "Server-only" vs "Client-side")
* ✅ Code review checklist includes "No sensitive information exposed"
* ✅ Never use `NEXT_PUBLIC_` prefix for secrets

**Reflection:**
* This was learned from the ShopLite case study where credentials were accidentally exposed
* Documentation in `.env.example` helps developers understand scope before adding variables

---

### Pitfall 2: Missing Environment Variables at Runtime

**Problem:**
* Application crashes with "undefined" errors when required variables are missing
* Different behavior between development and production

**How we avoided it:**
* ✅ `.env.example` documents all required variables
* ✅ Validation checks in application startup (can be added to `next.config.ts` or startup script)
* ✅ Clear error messages pointing to missing variables
* ✅ Docker deployment uses explicit environment variable injection

**Reflection:**
* The "Never-Ending Deployment Loop" case study showed this issue
* We ensure all required variables are documented and validated

---

### Pitfall 3: Build-Time vs Runtime Confusion

**Problem:**
* Developers change `NEXT_PUBLIC_*` variables but don't rebuild
* Server-only variables used in client code (result: undefined)

**How we avoided it:**
* ✅ Clear documentation of build-time vs runtime behavior
* ✅ `.env.example` includes scope notes for each variable
* ✅ Code examples in README showing correct usage patterns
* ✅ TypeScript types can help catch client-side access to server-only variables

**Reflection:**
* Understanding Next.js variable embedding is crucial
* Documentation helps prevent misuse, even if it seems obvious to experienced developers

---

### Pitfall 4: Environment-Specific Configuration Mixing

**Problem:**
* Staging credentials used in production (like ShopLite incident)
* Manual credential copying leads to errors

**How we avoided it:**
* ✅ Separate environment files: `.env.development`, `.env.staging`, `.env.production`
* ✅ CI/CD uses environment-specific secrets (GitHub Secrets scoped per environment)
* ✅ Production secrets never stored locally or in code
* ✅ Docker images are environment-agnostic (variables injected at deployment time)

**Reflection:**
* This directly addresses the ShopLite case study failure
* Our architecture ensures production can never accidentally access staging credentials

---

### Pitfall 5: Weak or Missing Secrets

**Problem:**
* Using weak secrets (e.g., "password123") in production
* Reusing secrets across environments

**How we avoided it:**
* ✅ `.env.example` specifies minimum length (32 characters for JWT_SECRET)
* ✅ Documentation emphasizes generating strong random strings
* ✅ Each environment should have unique secrets
* ✅ Production secrets should be generated using secure random generators

**Reflection:**
* Security best practices are documented upfront
* Helps developers avoid creating weak configurations

---

## Summary: Environment Variable Best Practices

✅ **DO:**
* Use `.env.local` for local development secrets
* Keep `.env.example` updated and committed
* Prefix client-safe variables with `NEXT_PUBLIC_`
* Document scope (server vs client) for each variable
* Validate required variables at startup
* Use strong, unique secrets per environment
* Keep production secrets in secure secret managers

❌ **DON'T:**
* Commit `.env.local` or any file with actual secrets
* Use `NEXT_PUBLIC_` for sensitive data
* Share secrets between environments
* Use weak or default secrets in production
* Access server-only variables in client code
* Hardcode configuration values in code

---

## Case Study: The Never-Ending Deployment Loop

**Problem scenario (QuickServe app)**
* “Environment variable not found”
* “Port already in use”
* Old containers keep running after deploys

**What’s going wrong**
* Missing env vars crash containers
* Old containers not stopped → port conflicts
* No versioning → inconsistent production state

**Root causes**
* Poor container lifecycle management
* Weak CI/CD pipeline configuration
* Missing cleanup and validation steps

**Fixes**
* Versioned images (e.g., `quickserve:v1.0.1`)
* Stop/remove old containers before deploying new ones
* Validate required env vars before startup
* Add health checks and rollback strategies

**Improved flow**
Code push → CI build → Test → Tag image → Deploy → Stop old container → Start new container

**Reflection**
* Challenges: debugging pipeline failures, env-var crashes, reading cloud logs
* Wins: Docker consistency, CI/CD reduced manual effort, automation boosted confidence
* Next: add rollbacks, use IaC (Terraform/Bicep), add monitoring and alerting

**Takeaways**
* Docker standardizes environments and deployment artifacts
* CI/CD automates build/test/deploy to reduce human error
* Secure secrets, version images, isolate environments, and clean old containers to avoid conflicts and drift

## 🔀 Git Workflow & Contribution Guidelines

---

## Database Schema & Data Modeling

### Core Entities

- **User**: Represents a person using the platform (admin or regular user). Users can own projects, be members of teams, be assigned tasks, and write comments.
- **Team**: Logical grouping of users working together. Teams can own multiple projects.
- **TeamMember**: Join table that connects `User` and `Team` with an additional `role` (OWNER / ADMIN / MEMBER).
- **Project**: A unit of work or product area (e.g., "Full Stack Next.js App") owned by a single user and optionally associated with a team.
- **Task**: Individual actionable item under a project, assigned to a single user. Tasks can have comments.
- **Comment**: Discussion messages attached to tasks, authored by users.

### Prisma Schema (Excerpt)

```12:104:server-side/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            Int           @id @default(autoincrement())
  name          String
  email         String        @unique
  role          UserRole      @default(USER)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  tasks         Task[]
  projectsOwned Project[]     @relation("ProjectOwner")
  comments      Comment[]
  memberships   TeamMember[]
}
```

This schema defines:

- **Primary keys**: All `id` fields are primary keys via `@id @default(autoincrement())`.
- **Foreign keys**:
  - `Task.userId → User.id`
  - `Task.projectId → Project.id`
  - `Project.ownerId → User.id`
  - `Project.teamId → Team.id`
  - `TeamMember.teamId → Team.id`
  - `TeamMember.userId → User.id`
  - `Comment.taskId → Task.id`
  - `Comment.authorId → User.id`
- **Relations with delete behavior**:
  - `onDelete: Cascade` on `Task.user`, `Task.project`, `Comment.task`, `Comment.author`, `TeamMember.user`, `TeamMember.team` so that child rows are cleaned up when a parent is deleted.
  - `onDelete: SetNull` on `Project.team` so projects can outlive team deletion while dropping the `teamId`.

### Constraints & Indexes

- **NOT NULL**:
  - All scalar fields without `?` (e.g., `User.email`, `Task.title`, `Project.ownerId`) are required, enforcing 1NF (no nullable core identifiers).
- **UNIQUE**:
  - `User.email` is unique to prevent duplicate accounts.
  - `Team.name` is unique to avoid confusion between teams.
  - Composite unique on `TeamMember(teamId, userId)` prevents duplicate membership rows.
- **Indexes**:
  - `@@index([userId])` on `Task` optimizes queries like "all tasks for a user".
  - `@@index([projectId, completed])` on `Task` speeds up project task lists filtered by completion.
  - `@@index([ownerId])` and `@@index([teamId])` on `Project` support dashboard views by owner or team.
  - `@@index([taskId])` on `Comment` accelerates loading comments for a task.

### Normalization & Query Patterns

- **1NF**: All attributes are atomic (no arrays in columns), and each table has a primary key.
- **2NF**: Non-key attributes depend on the whole key:
  - In `TeamMember`, non-key columns (`role`) depend on the composite key `(teamId, userId)` (modeled via unique constraint).
- **3NF**: No transitive dependencies:
  - User role info is stored only in `User` (not copied to `Task` or `Comment`).
  - Team-level details (`description`) live only in `Team`, while membership-specific details live in `TeamMember`.

This structure supports common queries efficiently:

- Get all tasks for a user, optionally filtered by project or completion.
- Get all projects for a team and the members working on them.
- Get task details with comments and authors for a project board.

### Migrations & Seeding

From the `server-side` directory:

- **Run migrations**:

  ```bash
  npx prisma migrate dev --name init_schema
  ```

  This uses `prisma/schema.prisma` to create tables and relations in the PostgreSQL database defined by `DATABASE_URL`. Capture a screenshot of the terminal showing successful migration for submission.

- **Generate Prisma Client** (usually runs automatically on migrate, but can be explicit):

  ```bash
  npx prisma generate
  ```

- **Seed data**:

  ```bash
  npx prisma db seed
  ```

  The seeding script:

  - Creates three users (`Alice`, `Bob`, `Charlie`) with appropriate roles.
  - Creates one team and links the users via `TeamMember` with OWNER/MEMBER roles.
  - Creates a project owned by Alice and associated with the team.
  - Creates three tasks assigned to users and linked to the project.
  - Adds comments on tasks to verify the `Comment` relationships.

  Take a screenshot of the terminal output (`Database seeded successfully ✅`) as evidence of successful seeding.

### Migration Workflow, Reset, and Verification

- **Create and run the first migration** (already configured for `init_schema`):

  ```bash
  npx prisma migrate dev --name init_schema
  ```

  This:

  - Creates the required tables and relationships in the database.
  - Generates SQL migration files under `prisma/migrations/<timestamp>_init_schema/`.

- **Make future schema changes**:

  After editing `prisma/schema.prisma`, create a new migration, for example:

  ```bash
  npx prisma migrate dev --name add_new_table
  ```

  Each migration captures an incremental change, preserving a full history of schema evolution.

- **Reset the database while keeping migration history**:

  ```bash
  npx prisma migrate reset
  ```

  This command:

  - Drops and recreates the database.
  - Re-applies all migrations in order.
  - Re-runs the seed script (`prisma db seed`) automatically.

  This is ideal for local development when you want a clean database while still validating that your migration chain is consistent.

- **Verify seeded data**:

  - Use Prisma Studio:

    ```bash
    npx prisma studio
    ```

    Then, in the browser UI, inspect `User`, `Project`, `Task`, `Team`, and `Comment` tables to confirm the seed records.

  - Or use your SQL client to query the tables directly.

- **Idempotent seeding**:

  - The `prisma/seed.ts` script first clears all existing records using `deleteMany` inside a transaction.
  - This means running `npx prisma db seed` multiple times will not duplicate data; you always end up with the same consistent seed state.

### Reflection: Protecting Production Data During Migrations

- In development, commands like `migrate reset` and destructive seeding are safe and convenient.
- In staging/production:
  - Never run `prisma migrate reset` against real data; use `prisma migrate deploy` instead to apply existing migrations without dropping the database.
  - Avoid destructive operations (`deleteMany`, test seeds) against production; use one-way, append-only migrations and dedicated data-migration scripts that are carefully reviewed.
  - Ensure that environment variables (`DATABASE_URL`) clearly distinguish dev/staging/prod and are managed via secret managers so you do not accidentally point migration commands at a production database.


### Reflection & Challenges

- **Design choices**:
  - Introduced join table `TeamMember` to correctly model the many-to-many `User ↔ Team` relationship without duplicating data.
  - Used enums (`UserRole`, `TeamRole`, `ProjectStatus`) instead of free-form strings to improve data integrity and avoid magic strings in queries.
  - Chose `onDelete: Cascade` for most child relations to keep data clean, and `onDelete: SetNull` where historical records should survive parent deletion.
- **Potential challenges**:
  - Ensuring relationships are correctly directional (e.g., `Project.owner` vs `Task.assignee`) to avoid cyclic or ambiguous relations.
  - Aligning the schema with frontend expectations (mock users/tasks) so that future API routes can be backed by this database without major changes.
- **Future improvements**:
  - Add soft-delete flags instead of hard deletes for auditability.
  - Introduce additional indexes once query patterns from production are known (e.g., by `dueDate` or `status` for reporting).


### Branch Naming Convention
We follow a structured branch naming strategy:

- feature/<feature-name>
- fix/<bug-name>
- chore/<task-name>
- docs/<update-name>

### Pull Request Process
- All changes must be submitted via Pull Requests
- Direct pushes to `main` are disabled
- Each PR must follow the PR template
- At least one team member must approve before merge

### Code Review Checklist
- Code builds and runs correctly
- No console errors or warnings
- ESLint & Prettier checks pass
- Code is readable and documented
- No sensitive information exposed

### Why This Workflow
This workflow ensures:
- High code quality
- Clean Git history
- Faster and safer collaboration
- Production stability for OASIS

---

## Error Handling Middleware

### Why Centralized Error Handling Matters

Modern web apps can fail in many ways — from API timeouts to database issues. Without a centralized strategy, errors become scattered, logs inconsistent, and debugging difficult.

A centralized error handler ensures:

- **Consistency**: Every error follows a uniform response format.
- **Security**: Sensitive stack traces are hidden in production.
- **Observability**: Structured logs make debugging and monitoring easier.

| Environment | Behavior |
|------------|----------|
| Development | Show detailed error messages and stack traces. |
| Production | Log detailed errors internally, but send minimal, user-safe messages. |

### Project Structure for Error Handling

```
app/
 ├── api/
 │    ├── users/
 │    │    ├── route.ts
 ├── lib/
 │    ├── logger.ts
 │    ├── errorHandler.ts
```

### Implementation

#### Logger Utility (lib/logger.ts)

We use structured logging to keep error data readable and traceable:

```typescript
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: "info", message, meta, timestamp: new Date() }));
  },
  error: (message: string, meta?: any) => {
    console.error(JSON.stringify({ level: "error", message, meta, timestamp: new Date() }));
  },
};
```

#### Centralized Error Handler (lib/errorHandler.ts)

The error handler classifies and formats errors based on type and environment:

```typescript
import { NextResponse } from "next/server";
import { logger } from "./logger";

export function handleError(error: any, context: string) {
  const isProd = process.env.NODE_ENV === "production";

  const errorResponse = {
    success: false,
    message: isProd
      ? "Something went wrong. Please try again later."
      : error.message || "Unknown error",
    ...(isProd ? {} : { stack: error.stack }),
  };

  logger.error(`Error in ${context}`, {
    message: error.message,
    stack: isProd ? "REDACTED" : error.stack,
  });

  return NextResponse.json(errorResponse, { status: 500 });
}
```

**Key Idea**: Errors are logged with full details, but stack traces are hidden from the user in production for security.

#### Using the Error Handler in Routes (app/api/users/route.ts)

```typescript
import { NextResponse } from "next/server";
import { handleError } from "@/lib/errorHandler";

export async function GET() {
  try {
    // Simulate database or API failure
    throw new Error("Database connection failed!");
  } catch (error) {
    return handleError(error, "GET /api/users");
  }
}
```

### Testing in Development vs Production

#### Development Mode

Request:
```bash
curl -X GET http://localhost:3000/api/users
```

Response:
```json
{
  "success": false,
  "message": "Database connection failed!",
  "stack": "Error: Database connection failed! at ..."
}
```

#### Production Mode (NODE_ENV=production)

Response:
```json
{
  "success": false,
  "message": "Something went wrong. Please try again later."
}
```

Log (Console or CloudWatch):
```json
{
  "level": "error",
  "message": "Error in GET /api/users",
  "meta": {
    "message": "Database connection failed!",
    "stack": "REDACTED"
  },
  "timestamp": "2025-10-29T16:45:00Z"
}
```

### Reflection

**How structured logs aid debugging**:
- Structured JSON logs are machine-readable and easily searchable
- Consistent format across all errors makes pattern recognition simple
- Contextual information (timestamp, error location) helps trace issues quickly
- Can be integrated with log aggregation tools like CloudWatch, Splunk, or Datadog

**Why redacting sensitive data builds user trust**:
- Stack traces can expose internal system architecture and file paths
- Error details may contain sensitive database queries or API keys
- Users don't need technical details; they need reassurance
- Clean error messages prevent information leakage to potential attackers

**How to extend the handler for custom error types**:
- Create custom error classes (e.g., `ValidationError`, `AuthError`, `DatabaseError`)
- Add type-specific handling in the error handler:
  ```typescript
  if (error instanceof ValidationError) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
  if (error instanceof AuthError) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  ```
- Map error types to appropriate HTTP status codes
- Include error codes for client-side error categorization

**Pro Tip**: "A professional app doesn't just run smoothly — it fails gracefully. Good error handling isn't about hiding errors; it's about handling them intelligently."
---

## Transactional Email Service Integration

### Overview

**OASIS** implements a robust transactional email service using **SendGrid** to send automated notifications for critical user events. Unlike marketing emails, transactional emails are trigger-based and automatically sent by the backend when important actions occur.

### Why Transactional Emails Matter

Transactional emails are essential for:
- **User Engagement**: Keep users informed about their account activity
- **Trust Building**: Professional, timely communications build credibility
- **Security**: Alert users about important account changes
- **User Experience**: Automate confirmations and notifications

### Event-to-Email Mapping

| User Event | Email Type | Template Used |
|------------|-----------|---------------|
| New user registration | Welcome email | `welcomeTemplate()` |
| Password reset request | Reset link with expiry | `passwordResetTemplate()` |
| Email verification | Verification link | `emailVerificationTemplate()` |
| Payment success | Invoice confirmation | `paymentConfirmationTemplate()` |
| Security alert | Account notification | `accountAlertTemplate()` |
| Activity notification | Update notification | `activityNotificationTemplate()` |

---

### Provider Selection: SendGrid

We chose **SendGrid** over AWS SES for the following reasons:

#### SendGrid vs AWS SES Comparison

| Feature | SendGrid | AWS SES |
|---------|----------|---------|
| **Pricing** | Free tier: 100 emails/day | Pay-per-email ($0.10/1000) |
| **Setup Complexity** | Simple API key setup | Requires AWS credentials, IAM roles |
| **Email Verification** | Single sender verification | Domain verification required |
| **Development Speed** | Quick integration | More configuration steps |
| **Dashboard** | User-friendly analytics | Integrated with CloudWatch |
| **Deliverability** | Excellent reputation | Excellent reputation |
| **Best For** | Rapid development, startups | Enterprise, AWS-integrated apps |

**Our Choice**: **SendGrid** for rapid development and ease of setup, with the free tier sufficient for our current user base.

---

### Implementation Architecture

#### 1. API Endpoint: /api/email

The email service is exposed through a POST endpoint that accepts:
- `to`: Recipient email address (validated)
- `subject`: Email subject line
- `message`: HTML content

**Key Features**:
- ✅ Email format validation
- ✅ Environment variable validation
- ✅ Comprehensive error handling
- ✅ Detailed logging with message IDs
- ✅ SendGrid-specific error parsing

**Location**: client-side/app/api/email/route.ts

#### 2. Email Templates

We've created six reusable, professionally-styled HTML email templates:

1. **Welcome Email** - Onboarding new users
2. **Password Reset** - Secure password recovery with expiring tokens
3. **Email Verification** - Confirm email ownership
4. **Payment Confirmation** - Transaction receipts
5. **Account Alert** - Security notifications
6. **Activity Notification** - General user activity updates

**Template Features**:
- Responsive HTML design
- Consistent branding with gradient headers
- Proper HTML structure with inline CSS
- Mobile-friendly layout
- Professional footer with unsubscribe links

**Location**: client-side/lib/emailTemplates.ts

---

### Setup Instructions

#### Step 1: Create SendGrid Account

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Navigate to **Settings → Sender Authentication**
3. Verify your sender email address
4. Generate an API Key under **Settings → API Keys**
   - Select "Full Access" permissions
   - Save the API key securely

#### Step 2: Configure Environment Variables

Create a .env.local file in the client-side directory:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your-actual-api-key-here
SENDGRID_SENDER=no-reply@yourdomain.com

# Application URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: 
- Never commit .env.local to version control
- Use .env.example as a template for team members
- In production, use environment variables from your hosting platform

#### Step 3: Install Dependencies

```bash
cd client-side
npm install @sendgrid/mail
```

---

### Usage Examples

#### Example 1: Send Welcome Email

```typescript
import { welcomeTemplate } from '@/lib/emailTemplates';

const response = await fetch('/api/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'newuser@example.com',
    subject: 'Welcome to Kalvium!',
    message: welcomeTemplate('John Doe')
  })
});

const result = await response.json();
console.log(result); // { success: true, messageId: "...", statusCode: 202 }
```

#### Example 2: Send Password Reset

```typescript
import { passwordResetTemplate } from '@/lib/emailTemplates';

const resetToken = generateSecureToken();
const response = await fetch('/api/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Reset Your Password',
    message: passwordResetTemplate('Jane Smith', resetToken, 60)
  })
});
```

#### Example 3: Test via cURL

```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "student@example.com",
    "subject": "Test Email from Kalvium",
    "message": "<h2>Hello from OASIS! 🚀</h2><p>This is a test email.</p>"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "messageId": "01010189b2example123",
  "statusCode": 202
}
```

---

### Testing and Verification

#### Test Cases Performed

1. ✅ **Valid Email Send**: Successfully sent email with proper credentials
2. ✅ **Invalid Email Format**: Returns 400 error with validation message
3. ✅ **Missing Fields**: Returns 400 error specifying missing fields
4. ✅ **Invalid API Key**: Returns 401 error from SendGrid
5. ✅ **Network Failure**: Handles timeout and connection errors gracefully

#### Sandbox vs Production Mode

**SendGrid Sandbox Mode**:
- Available in free tier accounts
- Emails are "sent" but not actually delivered
- Used for testing API integration
- No email deliverability verification needed

**Production Mode**:
- Requires sender domain verification (SPF, DKIM)
- Real email delivery
- Better reputation management
- Access to full analytics

**Our Setup**: Currently using **verified sender email** in production mode for actual delivery to users.

---

### Common Issues and Solutions

#### Issue 1: Emails Not Delivered

**Symptoms**: API returns success but emails don't arrive

**Solutions**:
- Check spam/junk folder
- Verify sender email in SendGrid dashboard
- Ensure recipient email is valid
- Check SendGrid activity dashboard for bounce/block status
- In sandbox mode, emails won't actually deliver

#### Issue 2: 401 Unauthorized Error

**Symptoms**: API returns unauthorized error

**Solutions**:
- Verify SENDGRID_API_KEY is correct in .env.local
- Ensure API key has "Full Access" permissions
- Check for extra spaces or quotes in environment variable
- Regenerate API key if compromised

#### Issue 3: Rate Limit Exceeded

**Symptoms**: 429 Too Many Requests error

**Solutions**:
- Free tier: 100 emails/day limit
- Implement exponential backoff retry logic
- Use a queue system (e.g., Bull, Redis Queue) for high volumes
- Consider upgrading to paid plan for higher limits

#### Issue 4: Slow Email Sends

**Symptoms**: API takes >3 seconds to respond

**Solutions**:
- Move email sending to background jobs
- Use message queues (e.g., AWS SQS, RabbitMQ)
- Implement fire-and-forget pattern for non-critical emails
- Cache template generation

---

### Advanced Considerations

#### 1. Rate Limiting and Throttling

**Current Limits** (SendGrid Free Tier):
- 100 emails per day
- No burst rate limit

**Scaling Strategies**:
- Implement request queuing with Redis or Bull
- Add exponential backoff for failed sends
- Monitor daily usage and alert near limits
- Batch non-urgent emails

#### 2. Bounce Handling

**Types of Bounces**:
- **Hard Bounce**: Permanent failure (invalid email, domain doesn't exist)
- **Soft Bounce**: Temporary failure (mailbox full, server down)
- **Spam Complaint**: User marked email as spam

**Handling Strategy**:
1. Monitor SendGrid dashboard for bounce rates
2. Automatically suppress hard bounced emails
3. Retry soft bounces after delay
4. Remove spam complainers from list immediately
5. Maintain bounce rate < 5% for good sender reputation

#### 3. Sender Authentication (SPF/DKIM)

**Why It Matters**:
- Prevents emails from going to spam
- Proves email authenticity
- Builds sender reputation
- Required for production domains

**Setup Steps**:
1. Add SPF record to DNS: v=spf1 include:sendgrid.net ~all
2. Add DKIM records provided by SendGrid
3. Verify domain in SendGrid dashboard
4. Monitor authentication status

**Current Status**: Using verified single sender email (sufficient for development and early production).

#### 4. Email Analytics

**Metrics to Track**:
- Delivery rate: % of emails successfully delivered
- Open rate: % of recipients who opened the email
- Click-through rate: % who clicked links
- Bounce rate: % of failed deliveries
- Spam complaint rate: % marked as spam

**SendGrid Dashboard**: Provides real-time analytics for all metrics.

---

### Security Best Practices

1. **Environment Variables**:
   - Never hardcode API keys
   - Use .env.local for local development
   - Use platform environment variables in production

2. **Rate Limiting**:
   - Implement API rate limiting to prevent abuse
   - Add CAPTCHA for user-facing email triggers

3. **Input Validation**:
   - Validate email format on frontend and backend
   - Sanitize HTML content to prevent XSS
   - Limit email size to prevent abuse

4. **Monitoring**:
   - Log all email sends with metadata
   - Alert on unusual sending patterns
   - Monitor bounce and spam rates

---

### Reflection and Learning Outcomes

#### What We Learned

1. **Provider Selection Matters**: SendGrid's ease of setup significantly reduced development time compared to AWS SES's more complex configuration.

2. **Template Reusability**: Creating a library of email templates ensures consistent branding and reduces duplication. HTML email design requires inline CSS and careful testing across email clients.

3. **Error Handling is Critical**: Email services can fail for many reasons (network issues, invalid recipients, rate limits). Comprehensive error handling and logging are essential for debugging.

4. **Sandbox vs Production**: Understanding the difference saved confusion during testing. Sandbox mode is perfect for integration testing without worrying about deliverability.

5. **Asynchronous Processing**: For production apps, email sending should be asynchronous to avoid blocking user requests. Background job queues are essential for scalability.

#### Production Readiness Checklist

- ✅ SendGrid account created and sender verified
- ✅ Environment variables configured
- ✅ Email API endpoint implemented with validation
- ✅ Six reusable email templates created
- ✅ Error handling and logging in place
- ✅ Tested successfully with real email delivery
- ⚠️ **TODO**: Implement background job queue for high volumes
- ⚠️ **TODO**: Set up domain authentication (SPF/DKIM)
- ⚠️ **TODO**: Configure SendGrid webhooks for bounce handling
- ⚠️ **TODO**: Add email rate limiting middleware

#### Future Enhancements

1. **Email Personalization**: Use user preferences and behavior to customize email content
2. **A/B Testing**: Test different subject lines and content for better engagement
3. **Scheduled Emails**: Implement delayed sending for optimal delivery times
4. **Multi-language Support**: Translate templates based on user locale
5. **Email Preview**: Add endpoint to preview emails before sending

---

### Conclusion

The transactional email service is now fully integrated into OASIS, providing automated, professional communication with users. The SendGrid implementation offers a balance of simplicity, reliability, and cost-effectiveness for our current scale, with clear paths for scaling as user volume grows.

**Key Takeaway**: "Professional email communication isn't just about sending messages — it's about building trust through timely, relevant, and well-designed notifications that enhance the user experience."


---

## Global State Management with Context API & Custom Hooks

### Overview

**OASIS** implements centralized global state management using React Context API combined with custom hooks. This approach eliminates prop-drilling, improves scalability, and makes state management predictable and maintainable.

### Why Global State Management Matters

**Problem**: Prop Drilling
```
Parent passes data → Child passes data → Grandchild passes data → ...
Only the deeply nested component needs it!
```

**Solution**: Context API
```
Parent provides data in Context
Any component can access it directly without intermediate props
```

### Key Concepts

| Concept | Purpose | Example |
|---------|---------|---------|
| **Context** | Central store for data | AuthContext holds user state |
| **Provider** | Makes context available | AuthProvider wraps app |
| **Hook** | Interface to access context | useAuth() returns user data |
| **Reducer** (optional) | Manages complex state | Dispatch actions for state changes |

---

### Architecture Overview

```
┌─────────────────────────────────────┐
│       RootLayout (app/layout.tsx)   │
├─────────────────────────────────────┤
│  <AuthProvider>                     │
│    <UIProvider>                     │
│      {children} ← All components    │
│    </UIProvider>                    │
│  </AuthProvider>                    │
└─────────────────────────────────────┘
         ↓
Components access state via custom hooks:
- useAuth() → Gets user, login, logout
- useUI() → Gets theme, sidebar, notifications
```

---

### Implementation

#### 1. AuthContext - Authentication State

**Location**: `context/AuthContext.tsx`

**State Managed**:
- `user`: Current logged-in user (null when not authenticated)
- `isLoading`: Login/logout operation in progress
- `error`: Error message if authentication fails

**Methods**:
- `login(username, email)`: Authenticate user
- `logout()`: Clear user state
- `clearError()`: Dismiss error message

**Key Features**:
- ✅ Async login with validation
- ✅ Error handling and state
- ✅ Callback memoization for performance
- ✅ Detailed console logging

```typescript
// Using AuthContext
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (username: string, email: string) => {
    setIsLoading(true);
    // Validate input
    // Simulate API call
    // Set user state
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### 2. UIContext - UI State Management

**Location**: `context/UIContext.tsx`

**State Managed**:
- `theme`: Current theme ("light" or "dark")
- `sidebarOpen`: Sidebar visibility state
- `notifications`: Array of toast notifications

**Methods**:
- `toggleTheme()`: Switch between light and dark
- `toggleSidebar()`: Toggle sidebar visibility
- `addNotification(message, type)`: Show notification
- `removeNotification(id)`: Dismiss notification

**Key Features**:
- ✅ Theme persistence (localStorage)
- ✅ Auto-dismissing notifications
- ✅ Sidebar state management
- ✅ Type-safe notification system

#### 3. Custom Hooks - Clean Interfaces

**useAuth Hook** (`hooks/useAuth.ts`)
```typescript
export function useAuth() {
  const { user, isLoading, error, login, logout } = useAuthContext();
  
  return {
    // Direct state
    user,
    isLoading,
    error,
    
    // Derived state
    isAuthenticated: !!user,
    userId: user?.id,
    username: user?.username,
    
    // Methods
    login,
    logout,
  };
}
```

**useUI Hook** (`hooks/useUI.ts`)
```typescript
export function useUI() {
  const { theme, toggleTheme, sidebarOpen, toggleSidebar, notifications } = useUIContext();
  
  return {
    theme,
    isDarkMode: theme === "dark",
    isLightMode: theme === "light",
    toggleTheme,
    sidebarOpen,
    openSidebar: () => setSidebarOpen(true),
    closeSidebar: () => setSidebarOpen(false),
    notifications,
    addNotification,
    removeNotification,
  };
}
```

---

### Provider Integration

**Location**: `app/layout.tsx`

```typescript
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <UIProvider>
            {children}
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Why nested?**
- AuthProvider is outer: Any component can use useAuth()
- UIProvider is inner: Can reference auth state if needed
- Both available everywhere without prop drilling

---

### Usage Examples

#### Example 1: Login/Logout in Component

```typescript
"use client";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm() {
  const { user, isAuthenticated, login, logout, isLoading, error } = useAuth();

  const handleLogin = async () => {
    await login("KalviumUser", "user@kalvium.com");
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Logged in as: {user.username}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          {error && <p className="error">{error}</p>}
          <button onClick={handleLogin} disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </>
      )}
    </div>
  );
}
```

#### Example 2: Theme Toggle

```typescript
"use client";
import { useUI } from "@/hooks/useUI";

export function ThemeToggle() {
  const { theme, toggleTheme, isDarkMode } = useUI();

  return (
    <div className={isDarkMode ? "dark" : "light"}>
      <button onClick={toggleTheme}>
        {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>
      <p>Current: {theme}</p>
    </div>
  );
}
```

#### Example 3: Using Multiple Contexts

```typescript
"use client";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";

export function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme, addNotification } = useUI();

  const handleAction = () => {
    addNotification(`Action performed by ${user.username}`, "success");
  };

  return (
    <div className={theme === "dark" ? "dark" : "light"}>
      {isAuthenticated && (
        <div>
          <h1>Welcome, {user.username}</h1>
          <button onClick={toggleTheme}>Change Theme</button>
          <button onClick={handleAction}>Perform Action</button>
        </div>
      )}
    </div>
  );
}
```

---

### Complete Example: App/page.tsx

The [app/page.tsx](client-side/app/page.tsx) demonstrates:
- ✅ Authentication form with validation
- ✅ Login/logout functionality
- ✅ Real-time state display
- ✅ Theme toggle with instant UI update
- ✅ Sidebar state management
- ✅ Toast notifications
- ✅ Component memoization for performance

**Features Demonstrated**:
1. **AuthSection**: Shows login form, displays user info when authenticated
2. **UIControlsSection**: Theme toggle, sidebar controls
3. **NotificationToast**: Auto-dismissing toast messages
4. **Real-time Console Logs**: All state changes logged

---

### Performance Optimization

#### 1. Context Splitting
We use **two separate contexts** instead of one mega-context:
- **AuthContext**: Holds authentication state
- **UIContext**: Holds UI state

**Why?**
- Components only re-render when their specific context changes
- Changing theme doesn't re-render auth components
- Logging out doesn't re-render theme components

#### 2. useCallback Memoization
All context methods use `useCallback` to maintain stable references:

```typescript
const login = useCallback(async (username, email) => {
  // Method implementation
}, []); // Empty dependency array - never changes
```

**Benefit**: Allows React.memo() components to skip re-renders

#### 3. Component Memoization
Sections in page.tsx use React.memo():

```typescript
const AuthSection = memo(() => {
  // Component implementation
});
```

**Benefit**: Only re-renders if props change, not parent updates

#### 4. Avoid Common Pitfalls

**DON'T**: Pass object literal as context value
```typescript
// ❌ BAD: Creates new object on every render
<AuthContext.Provider value={{ user, login }}>
```

**DO**: Memoize context value
```typescript
// ✅ GOOD: Stable object reference
const value = useMemo(() => ({ user, login }), [user]);
<AuthContext.Provider value={value}>
```

---

### State Management Patterns

#### Pattern 1: Simple State
```typescript
const [isOpen, setIsOpen] = useState(false);
// Simple boolean toggle
const toggle = () => setIsOpen(!isOpen);
```

#### Pattern 2: State with Effects
```typescript
const [theme, setTheme] = useState("light");

useEffect(() => {
  localStorage.setItem("theme", theme);
}, [theme]); // Re-run when theme changes
```

#### Pattern 3: Async Operations
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

const login = async (username, email) => {
  setIsLoading(true);
  setError(null);
  try {
    await apiCall();
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

#### Pattern 4: Reducer (Optional)
For complex state transitions, use useReducer:

```typescript
const initialState = { count: 0, history: [] };

function reducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + 1 };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(reducer, initialState);
```

---

### Debugging & Monitoring

#### Console Logging
All context methods log important events:

```
✅ User logged in: KalviumUser (user@kalvium.com)
✅ User logged out
🎨 Theme toggled to: dark
📱 Sidebar opened
📱 Sidebar closed
🔔 Notification (success): Welcome, KalviumUser!
```

#### React DevTools
1. Install React DevTools extension
2. Open DevTools in browser
3. Go to "Components" tab
4. Select AuthProvider or UIProvider
5. View:
   - Current context value
   - Component hierarchy
   - Props and state

#### Performance Profiler
1. Open React DevTools "Profiler" tab
2. Record an interaction (login, theme toggle)
3. See timeline of renders
4. Identify slow or unnecessary re-renders

---

### Common Patterns

#### Conditional Rendering Based on Auth
```typescript
function ProtectedContent() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in first</div>;
  }

  return <div>Welcome, {user.username}!</div>;
}
```

#### Error Handling and Recovery
```typescript
function LoginForm() {
  const { error, clearError, login } = useAuth();

  return (
    <div>
      {error && (
        <div>
          <p>{error}</p>
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
      <button onClick={() => login("user", "email@example.com")}>
        Try Again
      </button>
    </div>
  );
}
```

#### Notification Feedback
```typescript
function ActionButton() {
  const { addNotification } = useUI();
  const { login } = useAuth();

  const handleClick = async () => {
    try {
      await login("user", "email@example.com");
      addNotification("Login successful!", "success");
    } catch (err) {
      addNotification("Login failed: " + err.message, "error");
    }
  };

  return <button onClick={handleClick}>Login</button>;
}
```

---

### Reflection on Learning

#### Why Context API?
Context API is perfect for:
- ✅ Global app state (auth, theme, settings)
- ✅ Medium-complexity state management
- ✅ Avoiding prop drilling
- ✅ Built into React (no external libraries)

**Not ideal for**:
- ❌ Frequently changing state (form inputs)
- ❌ High-frequency updates (animations)
- ❌ Complex state with many actions (use Redux)

#### Benefits Achieved
1. **No Prop Drilling**: Components access state directly
2. **Maintainability**: Centralized state logic
3. **Reusability**: Custom hooks can be used anywhere
4. **Testability**: Contexts can be mocked in tests
5. **Scalability**: Easy to add new contexts or state

#### Common Pitfalls to Avoid
1. **Over-contextualization**: Don't put everything in context
2. **Unnecessary Re-renders**: Use context splitting
3. **Unstable Values**: Memoize context values
4. **Forgetting Memoization**: Use useCallback and useMemo
5. **Not Validating Context**: Always check context exists

#### Performance Characteristics
- **Updating State**: O(n) where n = components subscribed to context
- **Re-render Optimization**: Context splitting reduces impact
- **Memory**: Minimal (just stores state values)
- **Benchmark**: Faster than Redux for small-medium apps

---

### Best Practices

#### DO ✅
- Split contexts by concern (Auth, UI, etc.)
- Use custom hooks to wrap context consumption
- Memoize context values to prevent unnecessary renders
- Use TypeScript for type safety
- Log state changes for debugging
- Provide default/error boundaries

#### DON'T ❌
- Create one mega context with all app state
- Pass plain objects/functions as values (not memoized)
- Use context for frequently changing state
- Access context directly in components (use hooks)
- Forget to handle missing context (throw error)
- Put everything in one provider

---

### Production Readiness Checklist

- ✅ AuthContext with login/logout/error handling
- ✅ UIContext with theme, sidebar, notifications
- ✅ Custom hooks for clean component interfaces
- ✅ Providers integrated in layout
- ✅ TypeScript types for all contexts
- ✅ useCallback memoization for performance
- ✅ Component memoization where needed
- ✅ Console logging for debugging
- ✅ Error boundaries and validation
- ✅ Documentation and code comments
- ⚠️ **TODO**: Add localStorage persistence for theme
- ⚠️ **TODO**: Implement auth token storage
- ⚠️ **TODO**: Add Redux DevTools integration
- ⚠️ **TODO**: Performance profiling and optimization

---

### Future Enhancements

1. **Redux DevTools Integration**: Better state debugging
2. **Async Thunks**: Handle complex async operations
3. **Middleware**: Add logging, analytics, error tracking
4. **Persistence**: Save auth state to localStorage/sessionStorage
5. **Optimization**: Implement Context with useReducer for better updates
6. **Time-Travel Debugging**: Record and replay state changes
7. **Performance Monitoring**: Track render times and re-renders
8. **State Hydration**: Restore state from server on page load

---

### File Organization

```
client-side/
├── context/
│   ├── AuthContext.tsx         (230 lines)
│   │   ├── User state management
│   │   ├── Login/logout logic
│   │   └── Error handling
│   └── UIContext.tsx            (200 lines)
│       ├── Theme management
│       ├── Sidebar state
│       └── Notifications
├── hooks/
│   ├── useAuth.ts              (40 lines)
│   │   └── Wraps useAuthContext
│   └── useUI.ts                (50 lines)
│       └── Wraps useUIContext
└── app/
    ├── layout.tsx              (Updated)
    │   └── Providers integration
    └── page.tsx                (340 lines)
        ├── AuthSection component
        ├── UIControlsSection component
        └── NotificationToast component
```

---

### Related Files

- **Architecture Guide**: [CONTEXT_API_GUIDE.md](CONTEXT_API_GUIDE.md)
- **Data Flow Diagrams**: See CONTEXT_API_GUIDE.md for ASCII diagrams
- **Example Implementation**: [client-side/app/page.tsx](client-side/app/page.tsx)

---

### Conclusion

Global state management with Context API provides a clean, maintainable solution for sharing state across your Next.js application. By combining Context with custom hooks, we achieve:

- 🚀 Better performance through context splitting
- 📦 Cleaner components without prop drilling
- 🔧 Easier testing and maintenance
- 📈 Scalable architecture for growing apps
- 💡 Developer experience with clear patterns

**Key Takeaway**: "Context API + Custom Hooks is the sweet spot for global state management in React applications. It eliminates prop drilling while keeping the code simple, maintainable, and performant."

---

## Prisma Performance & Transactions

### 1. Transaction Scenarios & Atomicity
We use **Prisma Transactions** (`prisma.$transaction`) to ensure data integrity when multiple related operations must succeed or fail together.

**Scenario**: Creating a `Team` and adding the creator as the first `TeamMember`.
- **Logic**:
  1. Create `User` (if not exists).
  2. Create `Team`.
  3. Create `TeamMember` linking `User` and `Team`.
- **Atomicity**: If step 3 fails, the entire transaction rolls back, preventing "orphan" teams with no members.

**Implementation Example**:
```typescript
await prisma.$transaction(async (tx) => {
  const team = await tx.team.create({ ... });
  await tx.teamMember.create({ data: { teamId: team.id, ... } });
});
```

### 2. Rollback Verification
We simulate failures to verify rollback behavior.
- In `server-side/src/transaction-demo.ts`, the `runRollback()` function intentionally throws an error inside a transaction.
- **Result**: The database remains unchanged (no partial data written), confirming atomicity.

### 3. Database Indexes for Performance
We added specific indexes to `schema.prisma` to optimize frequent query patterns:
- **`@@index([status])` on Project**: Optimizes filtering projects by status (e.g., "Active" vs "Archived").
- **`@@index([userId])` on Task**: speeds up fetching a user's task list.
- **`@@index([teamId])` on Project**: Speeds up retrieving all projects for a specific team.

To apply these changes:
```bash
npx prisma migrate dev --name add_indexes
```

### 4. Query Optimization Strategy
We optimize Prisma queries to prevent N+1 issues and over-fetching:
- **Field Selection**: Using `select: { id: true, name: true }` instead of fetching the entire object reduces payload size.
- **Batch Operations**: Using `createMany` for bulk inserts reduces round-trips to the database.
- **Pagination**: Using `skip` and `take` prevents loading thousands of rows at once.

### 5. Running the Performance Demo
A demonstration script is included to showcase transactions, rollbacks, and query optimizations.

**Pre-requisites**:
- Docker containers must be running (`docker compose up -d`).
- `server-side` dependencies installed (`npm install`).

**Run the Demo**:
```bash
cd server-side
npm run prisma:demo
```
*Note: This script requires a running database connection.*

## Input Validation with Zod

We use **Zod** for schema validation to ensure data integrity before it reaches the database. This provides a type-safe way to validate API requests.

### Why Zod?

*   **Type Safety**: Zod schemas automatically infer TypeScript types.
*   **Runtime Validation**: catches invalid data before it touches the DB.
*   **User-Friendly Errors**: Provides clear messages (e.g., "Email is invalid").

### Usage

1.  **Define Schemas**: Located in `server-side/src/schemas`.
2.  **Validate**: Use `schema.parseAsync(data)` or helper functions.

### Running the Validation Demo

We created a demo script to showcase Zod validation in action (success and failure cases).

```bash
cd server-side
npm run validation:demo
```

### Example Code

```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

// Usage
try {
  const data = createUserSchema.parse(input);
  // data is now typed and safe
} catch (err) {
  // handle validation error
}
```

## Authorization Middleware (Role-Based Access)

We implemented a flexible authorization system to restrict access to sensitive resources based on `UserRole` (ADMIN, USER).

### How it Works

1.  **Middleware Factory**: `requireRole(allowedRoles)` creates a validation function.
2.  **Context**: Checks the `user.role` from the request context.
3.  **Protection**: Throws `AuthorizationError` if the role is insufficient.

### Running the Auth Demo

```bash
cd server-side
npm run auth:demo
```

### Example Usage

```typescript
import { requireRole } from './middleware/authorize';
import { UserRole } from '@prisma/client';

const adminOnlyHandler = {
  authorize: requireRole([UserRole.ADMIN]),
  execute: async () => { /* ... */ }
};
```

## Caching Layer (Redis)

We implemented a **Cache-Aside** strategy using Redis to improve performance for expensive operations.

### Configuration

*   **Helper**: `server-side/src/lib/redis.ts` handles the connection.
*   **Env Vars**: `REDIS_HOST` (default: 127.0.0.1) and `REDIS_PORT` (default: 6379).
*   **Dependencies**: Requires a running Redis instance (e.g., via Docker).

### Usage

Use the `getOrSetCache` helper to wrap expensive calls.

```typescript
import { getOrSetCache } from './lib/redis';

const data = await getOrSetCache('my-unique-key', async () => {
  // Expensive DB call
  return await db.query(...);
}, 60); // TTL in seconds
```

### Running the Cache Demo

To verify caching behavior (Hits vs Misses):

```bash
cd server-side
npm run cache:demo
```
*Note: Ensure Redis is reachable at `127.0.0.1:6379`.*

## File Uploads (AWS S3)

We use **AWS S3 Pre-Signed URLs** for secure, direct-to-bucket uploads.

### Helper
Located in `server-side/src/lib/storage.ts`:
- `generateUploadUrl(key, contentType)`: returns a short-lived URL for PUT requests.

### Configuration
Environment variables required:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_BUCKET_NAME`

### Running the Upload Demo
Simulates the flow (Generating URL -> Client Upload -> DB Save).

```bash
# Verify implementation
npm run upload:demo
```
*Note: Without real credentials, the S3 interaction is mocked or will fail gracefully.*

## Frontend Architecture

We use a modular component-based architecture for the Next.js frontend.

### Directory Structure
```
client-side/app/          # Next.js App Router pages
client-side/components/
 ├── layout/              # Shared layout components
 │    ├── Header.tsx      # Top navigation
 │    ├── Sidebar.tsx     # Side navigation
 │    └── LayoutWrapper.tsx # Wraps content with Header & Sidebar
 ├── ui/                  # Reusable UI elements
 │    ├── Button.tsx
 │    ├── Card.tsx
 │    └── InputField.tsx
 └── index.ts             # Barrel exports
```

### Layout
The `LayoutWrapper` in `app/layout.tsx` ensures that the `Header` and `Sidebar` are consistently applied to all pages.

### Dashboard
Visit `/dashboard` to see the shared layout and UI components in action.

## Client-side Data Fetching (SWR)

We use **SWR (Stale-While-Revalidate)** for efficient client-side data fetching.

### Benefits over `useEffect` + `fetch`
- **Automatic Caching**: Instant navigation between pages.
- **Revalidation**: Updates data when window is refocused or network reconnects.
- **Optimistic UI**: Mutate local data immediately while server updates in background.

### Usage
- `client-side/hooks/usePosts.ts`: Example hook wrapping SWR.
- `client-side/app/swr-demo/page.tsx`: Demo page showing caching and mutation.

**Try it out**: Visit `/swr-demo` and try adding a post!

## Form Handling & Validation

We use **React Hook Form** combined with **Zod** for performant, schema-based validation.

### Benefits
- **Performance**: Uncontrolled inputs minimize re-renders.
- **Type Safety**: Zod schemas infer TypeScript types automatically.
- **Reusability**: `FormInput` component handles error display logic.

### Usage
- `client-side/components/ui/FormInput.tsx`: Reusable wrapper for standard HTML inputs.
- `client-side/app/form-demo/page.tsx`: Example complex form with validation rules.

**Try it out**: Visit `/form-demo` to see validation in action.


