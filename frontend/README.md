# MineTech Frontend

React 19 + Vite frontend for the MineTech operations warm-up app. Talks to
the [minetech-backend](../minetech-backend) api-gateway over REST and to
core-service directly over socket.io for live updates.

## Stack

Vite · React 19 · TypeScript · pnpm · TanStack Query (server state) ·
Zustand (client/auth state, persisted) · react-router v7 · Radix UI +
Tailwind v4 + CVA · axios (single client, token interceptor) ·
socket.io-client.

## Prerequisites

- Node.js 20.x
- pnpm (`corepack enable pnpm` or `npm i -g pnpm`)
- The backend running (see `minetech-backend/README.md`)

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

`.env` defaults:

```
VITE_API_BASE_URL=http://localhost:3000   # api-gateway
VITE_SOCKET_URL=http://localhost:3001     # core-service (socket.io)
```

Open `http://localhost:5173` and log in with a seeded account:

- `admin@minetech.rw` / `Password123!`
- `supervisor@minetech.rw` / `Password123!`

## How it's organised (by feature, not file type)

```
src/
├── api/client.ts          # single axios instance, JWT interceptor
├── store/auth.store.ts    # zustand: token + user, persisted
├── lib/
│   ├── socket.ts          # authenticated socket.io hook
│   └── permissions.ts     # UI-only permission gating (mirrors backend)
├── routes/                # ProtectedRoute, AppLayout (nav + sign out)
├── components/ui/          # Radix + CVA primitives: Button, Badge, Dialog…
└── features/
    ├── auth/               # login page + API call
    ├── dashboard/          # live stats (TanStack Query + socket.io)
    ├── workers/            # list, add worker, check-in/out
    └── incidents/          # list, report (photo upload), advance status
```

## Notes on the live walkthrough

1. Log in as `admin@minetech.rw`.
2. Add a worker on the Workforce page, then check them in — the dashboard's
   "Workers on shift" count updates.
3. Open a second browser tab/window, log in again, go to Incidents.
4. In the first tab, report an incident with a photo. The second tab's
   incident list updates immediately via socket.io, no refresh — and
   `notification-service` logs a dispatched notification in its own
   terminal (gRPC call back to core-service to fetch the full record).
5. As admin, advance the incident from Reported → Under review → Resolved.
   A supervisor account can report incidents and see the dashboard, but the
   "Mark as…" button is hidden — and blocked server-side if attempted
   directly against the API.

## Build

```bash
pnpm build   # tsc -b && vite build, output in dist/
```
