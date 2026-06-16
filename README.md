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
7. [Environment Variables](#environment-variables)
8. [Running the App](#running-the-app)
9. [Seeding the Database](#seeding-the-database)
10. [API Reference](#api-reference)
11. [Authentication & Roles](#authentication--roles)
12. [Integration Layer (Dummy vs Live)](#integration-layer-dummy-vs-live)
13. [Webhooks](#webhooks)
14. [Cron Jobs](#cron-jobs)
15. [Notifications](#notifications)
16. [Reports](#reports)
17. [Analytics](#analytics)
18. [Database Schema](#database-schema)
19. [Testing the API](#testing-the-api)
20. [Switching to Live Mode](#switching-to-live-mode)
21. [Troubleshooting](#troubleshooting)

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
│   ├── generate-api-sheet.js    # Builds API_Test_Sheet.xlsx
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

## Environment Variables

Edit `.env` (already scaffolded in the repo):

| Variable | Default | Notes |
|---|---|---|
| `NODE_ENV` | `development` | `development` \| `production` \| `test` |
| `PORT` | `5000` | HTTP port |
| `API_VERSION` | `v1` | Mounted at `/api/{API_VERSION}` |
| `MONGODB_URI` | — | **Required.** Replace with your own connection string before sharing |
| `JWT_ACCESS_SECRET` | — | **Required.** 32+ random bytes |
| `JWT_ACCESS_EXPIRES_IN` | `1d` | |
| `JWT_REFRESH_SECRET` | — | **Required.** Distinct from access secret |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | |
| `BCRYPT_SALT_ROUNDS` | `10` | |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `Admin` / `admin@example.com` / `Admin@123` | Used by `npm run seed` |
| `INTEGRATION_MODE` | `dummy` | `dummy` (no creds) or `live` (real APIs) |
| `CRON_LEAD_SIMULATOR` | `true` | Disable for tests |
| `CRON_FOLLOWUP_REMINDER` | `true` | |
| `CRON_DAILY_SUMMARY` | `true` | |
| `WEBHOOK_META_SECRET` | `dummy-meta-secret` | Shared secret expected in `x-webhook-secret` header |
| `WEBHOOK_GOOGLE_SECRET` | `dummy-google-secret` | |
| `WEBHOOK_WEBSITE_SECRET` | `dummy-website-secret` | |
| `FCM_SERVER_KEY` | _(empty)_ | Empty = stub mode, logs to console |

> The shipped `.env` contains a working Atlas string for local demo. Rotate credentials before pushing the repo.

---

## Running the App

```bash
npm run dev      # nodemon, auto-restart
# or
npm start        # plain node
```

You should see:

```
MongoDB Connected: cluster0-shard-...
Server running on port 5000
API base: http://localhost:5000/api/v1
Docs:     http://localhost:5000/api-docs
Mode:     INTEGRATION_MODE=dummy
[cron] lead simulator scheduled (every 2 min)
[cron] follow-up reminder scheduled (hourly)
[cron] daily summary scheduled (09:00)
```

---

## Seeding the Database

```bash
npm run seed
```

Creates the default admin user (`admin@example.com` / `Admin@123` unless overridden in `.env`) and four sample leads across all four sources. Safe to re-run — both seeders are idempotent.

---

## API Reference

All authenticated endpoints expect:

```
Authorization: Bearer <accessToken>
```

The full request / response sample for every endpoint is in [`docs/API_Test_Sheet.xlsx`](docs/API_Test_Sheet.xlsx). A summary:

### Auth — `/api/v1/auth`
| Method | Path | Auth | Role |
|---|---|---|---|
| POST | `/register` | public | — |
| POST | `/login` | public | — |
| POST | `/refresh` | public | — |
| POST | `/logout` | required | any |
| GET | `/me` | required | any |

### Users — `/api/v1/users`
| Method | Path | Auth | Role |
|---|---|---|---|
| GET | `/profile` | required | any |
| GET | `/` | required | admin, manager |
| GET | `/:id` | required | admin, manager |
| PUT | `/:id` | required | admin |
| DELETE | `/:id` | required | admin |

### Leads — `/api/v1/leads`
| Method | Path | Auth | Role |
|---|---|---|---|
| GET | `/` | required | any |
| GET | `/:id` | required | any |
| GET | `/:id/activity` | required | any |
| POST | `/` | required | admin, manager |
| PUT | `/:id` | required | admin, manager, sales |
| DELETE | `/:id` | required | admin |
| PATCH | `/:id/assign` | required | admin, manager |
| POST | `/:id/remarks` | required | admin, manager, sales |

`GET /leads` supports: `?page=&limit=&search=&status=&source=&assignedTo=&from=&to=`

### Analytics — `/api/v1/analytics`
| Method | Path | Notes |
|---|---|---|
| GET | `/dashboard` | counts by status + conversion rate |
| GET | `/by-source` | per-source totals + conversion |
| GET | `/by-campaign` | optional `?source=` filter |
| GET | `/funnel` | counts ordered by funnel stage |
| GET | `/timeseries` | optional `?days=` (default 30, max 180) |
| GET | `/users-performance` | admin, manager only |

All accept `?from=` and `?to=` (ISO dates).

### Reports — `/api/v1/reports` (admin, manager)
| Method | Path | Filters |
|---|---|---|
| GET | `/excel` | `?from=&to=&source=&status=` |
| GET | `/pdf` | `?from=&to=&source=&status=` |

### Notifications — `/api/v1/notifications`
| Method | Path | Notes |
|---|---|---|
| GET | `/?page=&limit=&unread=true` | shows user / role / all targeted to caller |
| PATCH | `/:id/read` | |
| PATCH | `/read-all` | |
| POST | `/test` | dispatch a test notification |

### Integrations — `/api/v1/integrations`
| Method | Path | Auth | Role |
|---|---|---|---|
| GET | `/status` | required | any |
| POST | `/sync` | required | admin, manager |
| POST | `/simulate` | required | admin, manager |

### Webhooks (no `/api/v1` prefix) — `/webhooks`
| Method | Path | Auth |
|---|---|---|
| POST | `/website` | `x-webhook-secret` header |
| POST | `/meta` | `x-webhook-secret` header |
| POST | `/google` | `x-webhook-secret` header |

### System
| Method | Path | Notes |
|---|---|---|
| GET | `/` | root info |
| GET | `/health` | uptime + timestamp |
| GET | `/api-docs` | interactive Swagger UI |

---

## Authentication & Roles

Three roles:

| Role | Capabilities |
|---|---|
| `admin` | Everything: users CRUD, lead delete, all reports/analytics |
| `manager` | Lead create/update/assign, reports, analytics, integration sync |
| `sales` | Update assigned leads, add remarks, view own data |

Tokens:

- **Access token** — short-lived (1d default), used in `Authorization: Bearer …`
- **Refresh token** — long-lived (30d default), `POST /auth/refresh` to rotate

---

## Integration Layer (Dummy vs Live)

All three sources are abstracted behind a `BaseProvider` with the same shape:

```js
class XxxProvider extends BaseProvider {
  fetchLeads(count = 1) { ... }   // outbound pull
  normalize(raw) { ... }          // inbound webhook payload → unified shape
}
```

`provider.factory.js` instantiates one of each based on `INTEGRATION_MODE`:

- **`INTEGRATION_MODE=dummy`** (default) — `fetchLeads()` returns fabricated leads from `modules/integrations/dummy/dummy.data.js` (Indian names, phone numbers, plausible campaigns and inquiries). The `normalize()` calls still process real payload shapes, so webhook testing is realistic.
- **`INTEGRATION_MODE=live`** — `fetchLeads()` throws _"live mode not configured"_ until you implement the real API call. Domain code does not change.

A **dummy lead** end-to-end:

1. Either cron fires (every 2 min) **or** an admin calls `POST /integrations/simulate`
2. Factory picks a random provider
3. `fetchLeads()` returns a fake lead object
4. `integration.service.upsertLead()`:
   - de-duplicates by `(source, email | phone)`
   - inserts into `leads`
   - records a `leadactivities` row
   - emits a `new_lead` notification (audience: managers)

---

## Webhooks

The webhook routes accept the **real upstream payload shape** so you can switch from dummy to live without changing your normalization code.

### Website (`POST /webhooks/website`)

```http
POST /webhooks/website
Content-Type: application/json
x-webhook-secret: dummy-website-secret

{
  "name": "Website Visitor",
  "email": "visitor@example.com",
  "phone": "9876543210",
  "campaign": "Pricing Page",
  "inquiry": "Need quote for 5-car booking"
}
```

### Meta Lead Ads (`POST /webhooks/meta`)

Mirrors Meta Graph API `leadgen` payload:

```json
{
  "platform": "facebook",
  "campaign_name": "Summer Promo",
  "field_data": [
    { "name": "full_name",    "values": ["Meta Lead"] },
    { "name": "email",        "values": ["metalead@example.com"] },
    { "name": "phone_number", "values": ["9123456780"] }
  ]
}
```

### Google Lead Forms (`POST /webhooks/google`)

```json
{
  "campaign_name": "Search - Cabs",
  "user_column_data": [
    { "column_name": "FULL_NAME",    "string_value": "Google Lead" },
    { "column_name": "EMAIL",        "string_value": "g@example.com" },
    { "column_name": "PHONE_NUMBER", "string_value": "9112233445" }
  ]
}
```

---

## Cron Jobs

Defined in `modules/jobs/cron.js`. Each is independently toggleable via `.env`.

| Job | Schedule | What it does |
|---|---|---|
| `lead-simulator` | every 2 min | Pulls one lead from a random dummy provider, upserts it, notifies managers. Only useful in `INTEGRATION_MODE=dummy`. |
| `follow-up reminder` | hourly | Finds leads `status ∈ {new, contacted}` older than 24 h and sends a `follow_up_reminder` to the assignee (or to managers if unassigned). |
| `daily-summary` | every day at 09:00 | Aggregates today's counts and sends a `daily_summary` notification to every admin + manager. |

---

## Notifications

`notifications` documents are addressed three ways:

- **`audience: user`** — `userId` is the recipient
- **`audience: role`** — every user with `role` matches receives it
- **`audience: all`** — broadcast

`GET /notifications` for a logged-in user returns rows where any of the three audiencing rules match — that's enough for the mobile app to long-poll. The FCM stub (`fcm.stub.js`) logs to console when `FCM_SERVER_KEY` is empty; otherwise it's the place to wire the real Firebase call.

---

## Reports

- **Excel** — `GET /api/v1/reports/excel` — `exceljs` workbook with 9 columns (name, email, phone, source, campaign, status, assignedTo, inquiry, createdAt). Header row bold.
- **PDF** — `GET /api/v1/reports/pdf` — `pdfkit` table with paging, 6 columns, generated timestamp, total count.

Both support optional query filters: `?from=`, `?to=`, `?source=`, `?status=`. Returned as binary attachments with `Content-Disposition: attachment; filename=...`.

---

## Analytics

All endpoints return JSON wrapped in the standard `ApiResponse` envelope. Aggregations run via the MongoDB aggregation pipeline (no in-memory grouping).

- `GET /dashboard` — total + per-status counts + overall `conversionRate`
- `GET /by-source` — one row per source with `total`, `converted`, `conversionRate`
- `GET /by-campaign` — drilldown by `(source, campaign)`, optional `?source=` filter
- `GET /funnel` — counts in canonical funnel order
- `GET /timeseries` — date-bucketed counts for the last `?days=` (default 30)
- `GET /users-performance` — leaderboard of sales users by leads handled / converted

All accept `?from=` and `?to=` for date-range scoping.

---

## Database Schema

| Collection | Key fields |
|---|---|
| `users` | `name`, `email` (unique), `password` (bcrypt, `select:false`), `role` (admin/manager/sales), `isActive` |
| `leads` | `name`, `email`, `phone`, `source` enum, `campaign`, `inquiry`, `status` enum, `assignedTo` → User, `remarks[]` |
| `leadactivities` | `leadId` → Lead, `action` (string), `meta` (mixed), `performedBy` → User |
| `notifications` | `title`, `message`, `userId` → User, `type` enum, `leadId` → Lead, `audience` enum, `role` enum, `isRead` |

Indexes:

- `users.email` — unique
- `notifications.{userId, isRead, createdAt}` — for fast unread list
- `leadactivities.leadId` — for activity-by-lead lookup

---

## Testing the API

Three options:

1. **Swagger UI** — open `http://localhost:5000/api-docs` and click through.
2. **Postman / Insomnia** — import endpoints by copy-pasting from `docs/API_Test_Sheet.xlsx`. Set `accessToken` as an environment variable after login.
3. **MongoDB Compass** — connect to the URI in `.env` to inspect collections directly. Useful for verifying that webhook calls and cron jobs are creating documents.

`docs/API_Test_Sheet.xlsx` has three worksheets:

- **API Endpoints** — 38 rows, each with full URL / headers / body / sample response / notes
- **Setup & Auth Flow** — 12 ordered steps to get from a clean clone to watching the cron output
- **Mongo Collections** — schema cheatsheet for every collection and field

To regenerate the spreadsheet after edits:

```bash
node docs/generate-api-sheet.js
```

---

## Switching to Live Mode

1. Set `INTEGRATION_MODE=live` in `.env`.
2. Implement the `fetchLeads()` body in each provider:
   - `modules/integrations/meta/meta.provider.js` — Graph API page-level lead retrieval
   - `modules/integrations/google/google.provider.js` — Google Ads Lead Form Extension API
   - `modules/integrations/website/website.provider.js` — usually unnecessary; rely on the inbound webhook
3. Add your platform credentials to `.env` (`META_PAGE_ACCESS_TOKEN`, `GOOGLE_SERVICE_ACCOUNT_JSON`, etc.).
4. Set `FCM_SERVER_KEY` to enable real push.
5. Lock down webhooks by setting non-default values for `WEBHOOK_*_SECRET` and forwarding them to the platform's webhook subscription.

The factory / service / controller / route layers do not change. The normalizers already understand real Meta and Google payload shapes.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `MongooseServerSelectionError` | Bad `MONGODB_URI` — check IP allowlist on Atlas |
| Cron lines never appear | `CRON_*=false` in `.env`, or process crashed silently — check terminal |
| `401 Access denied. No token provided.` | Missing or stale `Authorization: Bearer …` header |
| `403 You are not authorized` | Logged in as `sales`; endpoint requires admin/manager |
| Webhook returns `401 Invalid webhook secret` | `x-webhook-secret` header doesn't match the value in `.env` |
| `Lead created` but no notification appears | Notifications target `audience: role` — ensure your user has that role |
| `MODULE_NOT_FOUND` after pull | `npm install` |
| PDF or Excel downloads as garbled text | Set the request type to "Send and Download" in Postman, or pipe to a file with curl `-o leads.xlsx` |

---

## Scripts

```bash
npm run dev      # development with nodemon
npm start        # production
npm run seed     # seed admin + sample leads
```

---

## License

ISC — interview project, free to fork.
