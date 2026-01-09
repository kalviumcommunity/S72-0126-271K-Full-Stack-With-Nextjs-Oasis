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

# 🔐 Environment-Aware Builds & Secure Secrets Management

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

# Cloud Deployments 101: Docker → CI/CD → AWS/Azure

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
* Use `.env` locally
* Use GitHub Secrets in CI/CD
* Use AWS Parameter Store or Azure Key Vault in production

**Example**

```env
DATABASE_URL=********
JWT_SECRET=********
```

Keeps security and flexibility across environments.

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