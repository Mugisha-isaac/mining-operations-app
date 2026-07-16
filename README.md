# MineTech

A mining-operations management app: workforce tracking (register workers, check them in and out of shifts) and safety-incident reporting (report with a photo, track through reported, under review, and resolved). Built as a small but realistic multi-service system rather than a single monolith, to demonstrate service boundaries, async messaging, and real-time updates.

The repo has two independent projects:

```
mining-operations-app/
├── backend/     NestJS monorepo: api-gateway, core-service, notification-service
└── frontend/    React 19 + Vite single-page app
```

Each has its own README with full setup steps. This file covers how the pieces fit together and how to get the whole thing running end to end.

## Architecture

```
┌─────────────┐      REST (JWT)       ┌──────────────┐
│  frontend   │ ────────────────────► │  api-gateway │
│  (Vite/SPA) │                       │  thin proxy  │
└──────┬──────┘                       └──────┬───────┘
       │ socket.io (JWT)                     │ forwards
       ▼                                     ▼
┌─────────────────────────────────────────────────────┐
│                    core-service                     │
│  Postgres · MinIO · RabbitMQ publisher · gRPC server │
│  socket.io gateway                                   │
└──────────────────────┬───────────────────────────────┘
                        │ incident.created (RabbitMQ)
                        ▼
              ┌───────────────────────┐
              │  notification-service │
              │  Bull/Redis queue     │
              │  gRPC client ─────────┼──► back to core-service
              └───────────────────────┘
```

- **api-gateway** holds no business logic. It checks for a valid JWT on every `/api/*` route and streams the request straight through to core-service, including multipart photo uploads.
- **core-service** owns Postgres (via TypeORM, every table tenant-scoped), issues and verifies JWTs, stores incident photos in MinIO, publishes `incident.created` onto RabbitMQ, pushes live updates over socket.io, and exposes a small gRPC server for service-to-service calls.
- **notification-service** consumes `incident.created` from RabbitMQ, queues the work on Redis-backed Bull so a slow downstream provider never blocks message acknowledgement, then calls core-service over gRPC to fetch the full incident record before logging the notification.
- **frontend** talks to api-gateway over REST for all reads and writes, and to core-service directly over socket.io for live dashboard and incident updates.

Two roles, enforced on the backend and mirrored in the UI: `ADMIN` can do everything, `SUPERVISOR` can report incidents and check workers in and out but cannot advance an incident's status. The frontend hides actions a role cannot perform, but `PermissionsGuard` on the backend is the actual security boundary.

## Stack

| Layer | Tech |
|---|---|
| Backend | NestJS, TypeScript, TypeORM, PostgreSQL, Redis, RabbitMQ, MinIO, gRPC, socket.io, Yarn workspaces |
| Frontend | React 19, TypeScript, Vite, TanStack Query, Zustand, react-router, Radix UI, Tailwind v4 |

## Running it end to end

You'll need Node.js 20.x and Docker.

**1. Start infrastructure and the backend** (see `backend/README.md` for details):

```bash
cd backend
docker compose -f docker-compose.infra.yml up -d
yarn install
cp apps/api-gateway/.env.example apps/api-gateway/.env
cp apps/core-service/.env.example apps/core-service/.env
cp apps/notification-service/.env.example apps/notification-service/.env
yarn workspace core-service migration:run
yarn workspace core-service seed
```

Then in three separate terminals:

```bash
yarn start:core
yarn start:notification
yarn start:gateway
```

**2. Start the frontend** (see `frontend/README.md` for details):

```bash
cd frontend
pnpm install
cp .env.example .env
pnpm dev
```

**3. Open the app** at `http://localhost:5173` and log in with a seeded account:

- `admin@minetech.rw` / `Password123!`
- `supervisor@minetech.rw` / `Password123!`

Swagger docs for core-service: `http://localhost:3001/docs`. Health checks: `GET /health` on all three backend services.

## Trying the real-time flow

1. Log in as `admin@minetech.rw` in one browser tab.
2. Add a worker on the Workforce page and check them in. The dashboard's "Workers on shift" count updates.
3. Open a second tab, log in again, and go to Incidents.
4. In the first tab, report an incident with a photo. The second tab's incident list updates immediately over socket.io, and notification-service logs a dispatched notification in its own terminal after fetching the full record over gRPC.
5. As admin, advance the incident from Reported to Under review to Resolved. A supervisor account can report incidents and view the dashboard, but has no option to change incident status, and is blocked server-side if they try to call the endpoint directly.

## Repository layout

```
backend/
├── docker-compose.infra.yml   Postgres, Redis, RabbitMQ, MinIO
├── proto/operations.proto     shared gRPC contract
├── libs/common/               enums, JWT/permission guards, tenant-scoped entity base
└── apps/
    ├── api-gateway/
    ├── core-service/
    └── notification-service/

frontend/
└── src/
    ├── api/                   axios client with JWT interceptor
    ├── store/                 zustand auth state
    ├── lib/                   socket.io hook, UI-only permission checks
    ├── routes/                protected routing, app layout
    ├── components/ui/         Radix + CVA primitives
    └── features/              auth, dashboard, workers, incidents
```
