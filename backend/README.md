# MineTech Backend

A minimal mining-operations backend: workforce management (register workers,
check them in/out of shifts) and safety incidents (report with a photo,
track through reported → under review → resolved).

Built as a NestJS monorepo with three apps behind a shared workspace:

```
backend/
├── docker-compose.infra.yml   # Postgres, Redis, RabbitMQ, MinIO
├── proto/operations.proto     # shared gRPC contract
├── libs/common/               # enums, JWT/permission guards, tenant-scoped
│                               entity base, RabbitMQ + gRPC constants
└── apps/
    ├── api-gateway/           # thin HTTP proxy, JWT-gated
    ├── core-service/          # all business logic, Postgres, MinIO,
    │                           RabbitMQ publisher, gRPC server, socket.io
    └── notification-service/  # RabbitMQ consumer → Bull queue → gRPC
                                  client back into core-service
```

## Architecture at a glance

- **api-gateway** does nothing but proxy. It checks for a valid JWT on every
  `/api/*` route and streams the request straight through to core-service
  (including multipart photo uploads) — no body parsing, no business logic.
  `/auth/login` is the one route it forwards without a token.
- **core-service** owns Postgres (via TypeORM, tenant-scoped everywhere),
  issues/verifies JWTs, stores incident photos in MinIO and serves them back
  via presigned URLs, publishes `incident.created` onto RabbitMQ, pushes
  live updates over a per-tenant socket.io room, and exposes a small gRPC
  server (`OperationsService`) for service-to-service calls.
- **notification-service** subscribes to `incident.created`, drops the work
  onto a Redis-backed Bull queue (so a slow "send" never blocks message
  acknowledgement), and the queue processor calls core-service over **gRPC**
  to fetch the full incident record before logging the notification.

Every write endpoint validates its body with `class-validator` DTOs. Every
tenant-owned table extends `TenantScopedEntity` and every query filters by
`tenantId`. Roles (`ADMIN`, `SUPERVISOR`) map to permissions, and
`PermissionsGuard` enforces them on the backend — the frontend hiding a
button is a UX nicety, not the security boundary.

## Prerequisites

- Node.js 20.x
- Yarn 4 (`corepack enable` will fetch it via `.yarnrc.yml`)
- Docker (for Postgres/Redis/RabbitMQ/MinIO)

## 1. Start infrastructure

```bash
docker compose -f docker-compose.infra.yml up -d
```

This brings up:
- Postgres on `5432` (db/user/pass: `minetech`)
- Redis on `6379`
- RabbitMQ on `5672` (management UI on `15672`, user/pass `minetech`)
- MinIO on `9000` (console on `9001`, user `minetech` / pass `minetech123`)

## 2. Install dependencies

```bash
yarn install
```

## 3. Configure environment

Copy the example env file for each app (defaults already match the compose
file above, so this mostly "just works" for local dev):

```bash
cp apps/api-gateway/.env.example apps/api-gateway/.env
cp apps/core-service/.env.example apps/core-service/.env
cp apps/notification-service/.env.example apps/notification-service/.env
```

**Important:** `JWT_SECRET` must be identical in `api-gateway/.env` and
`core-service/.env` — the gateway verifies tokens issued by core-service.

## 4. Run migrations and seed data

```bash
yarn workspace core-service migration:run
yarn workspace core-service seed
```

Seed creates one tenant ("Kivu Mine Site") with:
- `admin@minetech.rw` / `Password123!` (ADMIN)
- `supervisor@minetech.rw` / `Password123!` (SUPERVISOR)
- three workers (W-001, W-002, W-003)

## 5. Start the services (three terminals)

```bash
yarn start:core          # HTTP :3001, gRPC :5001
yarn start:notification  # health HTTP :3002, consumes RabbitMQ + Bull
yarn start:gateway       # HTTP :3000 — point the frontend here
```

Swagger docs: `http://localhost:3001/docs`
Health checks: `GET /health` on all three services.

## Walking through the brief's checklist

- **Login → protected APIs**: `POST /auth/login` on the gateway (proxied,
  public) returns a JWT; every `/api/*` route requires `Authorization:
  Bearer <token>`, checked at the gateway *and* again at core-service.
- **Tenant-scoped data**: `TenantScopedEntity` + every repository query
  filtering by `tenantId` (see `WorkersService`, `IncidentsService`).
- **Two roles, real permission checks**: `Role.ADMIN` / `Role.SUPERVISOR`,
  enforced by `PermissionsGuard` on every controller method.
- **Live dashboard**: `GET /api/dashboard/stats` plus a socket.io push
  (`incident:created`) the moment any session reports an incident.
- **Notification from a separate service**: RabbitMQ → Bull → gRPC, all in
  `notification-service`, fully decoupled from core-service's request
  lifecycle.

## Useful commands

```bash
yarn workspace core-service migration:generate -- src/database/migrations/MyChange
yarn infra:down   # stop Postgres/Redis/RabbitMQ/MinIO
```
