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