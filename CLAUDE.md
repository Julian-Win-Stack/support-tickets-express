# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Role-based support-ticket platform. Express 5 + SQLite REST API (backend, repo root) and a Next.js 16 / React 19 client (`frontend/`). Backend's distinguishing features: a DB-backed background job queue, a scheduled escalation sweep, an append-only audit trail, and an in-memory rate limiter.

## Commands

Run from repo root unless noted.

```bash
npm run dev            # backend (nodemon+tsx, :3001) + frontend (next, :3000) concurrently
npm start              # backend only, tsx server.ts
npm test               # full vitest suite (NODE_ENV=test, runs serially)
npx vitest run tests/integration/jobProcess.test.js   # single test file
npm run seed:admin     # seed an admin user
cd frontend && npm run build   # production build of the client
cd frontend && npm run lint    # ESLint — the ONLY linter in the repo (backend has none)
```

`npm run test:*` scripts (`test:jobsDb`, `test:worker`, etc.) are **standalone manual debugging scripts** in `scripts/`, not part of the vitest suite.

## Architecture

Three independent runtimes share one SQLite database:

- **API** (`app.ts` builds the app, `server.ts` starts it) — request/response. Routes → controllers → `lib/` data helpers.
- **Worker** (`lib/worker.ts`, started in `server.ts` only when `NODE_ENV !== 'test'`) — polls the `jobs` table every 1s, claims one runnable job in a transaction, dispatches by `type` to a handler in `lib/jobHandlers.ts`.
- **Scheduler** (`lib/scheduler.ts`) — every 10s sweeps `tickets` open >24h, marks them escalated, writes an audit event, and enqueues a `ticket_escalated` job.

Request flow for a mutation: controller updates the row → writes an `audit_events` row → enqueues a job (`lib/jobsDb.enqueueJob`). The worker later runs the handler, which inserts a `notifications` row. **These steps are intentionally non-atomic** — the user-facing update succeeds even if the audit write or enqueue fails (see README "Engineering Decisions").

### Layout
- `db/` — `db.ts` (connection), `schema.sql` (base tables), `migrations/` (numbered `NNN_*.sql`), `runMigrations.ts`, `seed.ts`, `types.ts` (row + job-payload types).
- `controllers/`, `routes/`, `middleware/` — standard Express split. `lib/` — job queue, worker, scheduler, notifications, rate-limit store.
- `BackendHelper/` — pure helpers (e.g. `buildTicketConstraints.ts` builds parameterized WHERE clauses for ticket queries).
- `frontend/` — Next.js App Router. Pages in `app/<route>/page.tsx`, API client in `frontend/lib/api.ts`, auth state in `frontend/contexts/`. See `frontend/STRUCTURE.md`.

## Critical conventions & gotchas

- **ESM, `NodeNext`.** Relative imports MUST carry a `.js` extension even though the source is `.ts` (e.g. `import { getDB } from '../db/db.js'`). Omitting it breaks at runtime.
- **DB path is `NODE_ENV`-dependent** (`db/db.ts`): `test.db` for test, `/tmp/app.db` for production, `app.db` for dev. Production uses `/tmp` — ephemeral on Railway, wiped on redeploy.
- **One shared connection.** Call `initDBConnection()` once at startup, then `getDB()` everywhere. Don't open new connections (`getDBConnection()` exists only for standalone scripts).
- **Schema changes go in a new numbered migration** under `db/migrations/`; `runMigrations.ts` applies unapplied files (tracked in `_migrations`) on every boot. `schema.sql` is for fresh DBs only and has comments pointing to the migrations that add later columns.
- **Job idempotency is at the notification layer, not the job.** There is no `dedupe_key` column (despite the README). `notifications` has a `UNIQUE(job_id, user_id)` index and `sendNotification` uses `INSERT OR IGNORE`, so a job running twice can't create duplicate notifications. Retry: max 3 attempts, backoff 10s then 60s, then `dead` (`lib/jobsDb.markFailed`).
- **Adding a job type** = add a handler to the `HANDLERS` map in `lib/jobHandlers.ts` AND a payload type to `PayloadUnion` in `db/types.ts`.
- **Notifications, audit log, and admin notification routes are admin-only** (all wrapped in `requireAdmin`). The notification bell is an admin feature.
- **Escalation audit events use the synthetic actor id `9999`** (no real system user row).
- **Frontend talks to the backend through a Next.js rewrite** (`frontend/next.config.ts` proxies `/api/:path*` → `NEXT_PUBLIC_API_URL` or `:3001`). The API client uses **relative URLs + `credentials: 'include'`** to keep cookies same-origin (avoids third-party-cookie blocking). Don't hardcode the backend origin in client fetches.
- **Session shape** is declared in `src/types/express-session.d.ts` (`session.userId`). `authUser` then `requireAdmin` is the standard middleware chain.
- **Rate limiter is in-memory** (`lib/rateLimitStore.ts`), per-process, reset between tests via `resetRateLimitStore()`. Returns 429 with `retryAfterSeconds`.

### Dead debug instrumentation
`app.ts` and `db/initDB.ts` contain `// #region agent log` blocks that `fetch('http://127.0.0.1:7242/...')`. These are leftover debug probes (calls are `.catch(()=>{})` no-ops if nothing listens). Safe to ignore; remove if you touch those files.

## Tests

Vitest + Supertest, integration-style, in `tests/integration/*.test.js` (**`.js`, not `.ts`**). `tests/setup.js` deletes `test.db` at startup; rate-limit store resets `beforeEach`. `vitest.config.js` sets `fileParallelism: false` (serial) because all tests share one SQLite file. Helpers in `tests/helpers/`.

## Environment

Backend `.env` (root): `SESSION_SECRET` (**required — app throws on boot if missing**), `CORS_ORIGIN`. Frontend `frontend/.env.local`: `NEXT_PUBLIC_API_URL` (rewrite target).

## Commits

Repo follows Conventional Commits with imperative subjects (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`), one logical change per commit — see `.cursor/rules/`.
