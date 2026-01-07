### Oasis
## For those who thirst for knowledge


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
