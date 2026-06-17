# LMS Backend — Automated Lead Management System

A centralized Lead Management System backend that aggregates leads from **Website**, **Meta Ads (Facebook & Instagram)**, and **Google Ads** into a single unified API for a React Native mobile dashboard.

Built as the Urban Cruise interview project. Designed to run end-to-end **without any third-party credentials** thanks to a pluggable dummy-provider layer — flip a single env flag (`INTEGRATION_MODE=live`) to switch to real APIs later, without touching domain code.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Installation](#installation)
7. [Scripts](#Scripts)

---

## Features

- JWT auth with access + refresh tokens, role-based authorization (admin / manager / sales)
- Lead CRUD with pagination, search, status workflow, assignment, remarks, and full activity audit trail
- **Pluggable provider adapter** for Website / Meta / Google — dummy or live mode
- **Dummy mode** generates realistic fake leads (no API keys needed)
- Inbound webhooks for all three providers with real-API payload shapes (verified by shared secret)
- Cron-driven autonomous behavior: lead simulator (every 2 min), follow-up reminders (hourly), daily admin summary (09:00)
- Notifications module with FCM stub — multi-audience (per user / per role / broadcast)
- Analytics: dashboard, by-source, by-campaign, funnel, time-series, per-user performance
- Reports as both **Excel** and **PDF**, with optional date / source / status filters
- Swagger UI for interactive exploration
- Helmet, CORS, rate limiting, request validation

---

## Tech Stack

- **Runtime:** Node.js, Express 5
- **Database:** MongoDB (Mongoose 9)
- **Auth:** JSON Web Tokens (`jsonwebtoken`) + `bcryptjs`
- **Validation:** `express-validator`
- **Security:** `helmet`, `cors`, `express-rate-limit`
- **Scheduling:** `node-cron`
- **Reports:** `exceljs`, `pdfkit`
- **Logging:** `morgan`
- **Docs:** `swagger-jsdoc`, `swagger-ui-express`

---

## Architecture

```
┌────────────────────────────┐
│   React Native Mobile App  │
└──────────────┬─────────────┘
               │ JWT
               ▼
┌────────────────────────────┐         ┌────────────────────────────┐
│        Express API         │◄────────┤ Inbound webhooks           │
│  /api/v1/*                 │         │ /webhooks/{website,meta,   │
│  • auth / users            │         │            google}         │
│  • leads + activity        │         └────────────────────────────┘
│  • analytics / reports     │
│  • notifications           │
│  • integrations            │
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────┐         ┌────────────────────────────┐
│       MongoDB              │         │ node-cron                  │
│ users, leads,              │◄────────┤ • lead simulator (2 min)   │
│ leadactivities,            │         │ • follow-up (hourly)       │
│ notifications              │         │ • daily summary (09:00)    │
└────────────────────────────┘         └────────────────────────────┘
           ▲
           │ normalize → upsert
           │
┌────────────────────────────┐
│  Provider Adapter Layer    │
│  (Website / Meta / Google) │
│   dummy  ⇄  live           │
└────────────────────────────┘
```

Domain code never knows whether a lead came from a real Graph API call or the dummy generator — the factory hands it whichever provider matches `INTEGRATION_MODE`.

---

## Project Structure

```
lms-back/
├── app.js                       # Express app: middleware, routes, swagger
├── server.js                    # Bootstrap: connect Mongo, start server + cron
├── package.json
├── .env                         # Local config (do not commit secrets)
│
├── config/
│   ├── db.js                    # Mongoose connection
│   └── env.js                   # Typed env loader
│
├── docs/
│   ├── swagger.js               # OpenAPI spec
│   └── API_Test_Sheet.xlsx      # Postman/Mongo testing reference
│
├── middlewares/
│   ├── auth.middleware.js       # JWT verify → req.user
│   ├── role.middleware.js       # authorize(...roles)
│   ├── validation.middleware.js # express-validator wrapper
│   ├── error.middleware.js      # Centralized error formatter
│   └── notFound.middleware.js   # 404 fallthrough
│
├── routes/
│   └── index.js                 # Mounts module routers under /api/v1
│
├── services/
│   └── jwt.service.js           # sign + verify access / refresh tokens
│
├── utils/
│   ├── ApiError.js              # statusCode-aware Error class
│   ├── apiResponse.js           # { success, statusCode, message, data }
│   └── asyncHandler.js          # try/catch wrapper for async routes
│
└── modules/
    ├── auth/                    # register, login, refresh, logout, me
    │   ├── auth.routes.js
    │   ├── auth.controller.js
    │   ├── auth.service.js
    │   └── auth.validation.js
    │
    ├── users/                   # user CRUD + profile
    │   ├── user.model.js
    │   ├── user.controller.js
    │   └── user.routes.js
    │
    ├── leads/                   # full lead lifecycle + activity audit
    │   ├── lead.model.js
    │   ├── leadActivity.model.js
    │   ├── lead.service.js
    │   ├── lead.controller.js
    │   ├── lead.routes.js
    │   └── lead.validation.js
    │
    ├── analytics/               # dashboard, by-source, by-campaign,
    │   ├── analytics.routes.js  # funnel, time-series, user performance
    │   ├── analytics.controller.js
    │   └── analytics.service.js
    │
    ├── reports/                 # Excel + PDF export
    │   ├── report.routes.js
    │   ├── report.controller.js
    │   └── report.service.js
    │
    ├── notifications/           # multi-audience notifications + FCM stub
    │   ├── notification.model.js
    │   ├── notification.service.js
    │   ├── notification.controller.js
    │   ├── notification.routes.js
    │   └── fcm.stub.js
    │
    ├── integrations/            # adapter layer for lead sources
    │   ├── base.provider.js
    │   ├── provider.factory.js
    │   ├── integration.service.js
    │   ├── integration.controller.js
    │   ├── integration.routes.js
    │   ├── dummy/dummy.data.js
    │   ├── website/website.provider.js
    │   ├── meta/meta.provider.js
    │   └── google/google.provider.js
    │
    ├── jobs/
    │   └── cron.js              # Lead simulator + reminders + summary
    │
    └── seeders/
        ├── index.js             # Entry: npm run seed
        ├── adminSeeder.js       # Creates default admin
        └── leadSeeder.js        # Inserts 4 sample leads
```

---

## Prerequisites

- **Node.js** 18+
- **MongoDB** (local 6+ or Atlas)
- A REST client — Postman / Insomnia / Thunder Client / curl

---

## Installation

```bash
git clone <repo-url>
cd lms-back
npm install
```

---

## Scripts

```bash
npm run dev      # development with nodemon
npm start        # production
npm run seed     # seed admin + sample leads
```
