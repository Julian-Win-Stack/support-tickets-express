---
name: Beginner implementation guide
overview: Clear step-by-step plan for Background Jobs + Notifications. Same scope as before; only the steps are listed, in order.
todos: []
isProject: false
---

# Background Jobs + Notifications — Clear Steps

**Already done:** `jobs` and `notifications` tables in db/schema.sql; blank files for lib/jobsDb.js, lib/notificationsDb.js, lib/worker.js, lib/jobHandlers.js, middleware/requireAdmin.js, routes/adminRouter.js, controllers/adminController.js.

---

## Implementation steps (do in this order)

1. **lib/jobsDb.js** — Add: `enqueue(type, payload)`, `claimNextRunnable()`, `markProcessing(id)`, `markSucceeded(id)`, `markFailed(id, lastError, options)`. Use `getDB()` for all DB access. For markFailed: if requeue, set status back to `queued` and `run_at` to now + backoff (e.g. 10s then 60s); else set status to `dead`.
2. **lib/notificationsDb.js** — Add: `createNotification({ userId, channel, subject, message, status: 'pending' })`, `listByUser(userId, limit?)`, `listLatest(limit)`.
3. **lib/jobHandlers.js** — Map each job type to an async handler(payload). Handlers only call `notificationsDb.createNotification(...)`. For `ticket_status_changed` use payload.userId as notification target; for `admin_note_created` look up ticket by ticketId to get owner user_id, then create notification for that user.
4. **lib/worker.js** — Add `startWorker(pollIntervalMs)`: loop every N ms, call `claimNextRunnable()` (in a short transaction: SELECT one row where status=queued and run_at<=now, then UPDATE that row to processing). If no job, skip. If job: run handler by type, then `markSucceeded(id)` or on error call `markFailed` (retry with backoff or mark dead). Export `stopWorker()` to clear the interval (for tests).
5. **middleware/requireAdmin.js** — After authUser: load user role from DB; if role !== 'admin', respond 403.
6. **controllers/adminController.js** — Add `listJobs(req, res)` (read req.query.status, default 'dead'; call jobsDb to list by status; res.json) and `listNotifications(req, res)` (if req.query.user_id use listByUser, else listLatest(50); res.json).
7. **routes/adminRouter.js** — GET `/jobs` → listJobs, GET `/notifications` → listNotifications.
8. **app.js** — Add: `app.use('/api/admin', authUser, requireAdmin, adminRouter)`.
9. **server.js** — After `app.listen(...)`, if `NODE_ENV !== 'test'` then call `startWorker(1500)`.
10. **controllers/ticketController.js** — In the admin status-change block, after the audit_events insert: get ticket owner user_id (from existingTicket or SELECT), then `enqueue('ticket_status_changed', { ticketId, userId, oldStatus, newStatus })`, then return response.
11. **controllers/notesController.js** — After the audit_events insert for a new note: `enqueue('admin_note_created', { ticketId: numberedTicketId, adminId: userId, noteBody: cleanBody })`, then return response.

---

## Manual test steps

1. Start the app; confirm DB has jobs and notifications tables.
2. Log in as admin, PATCH a ticket status. Check jobs table: one row type `ticket_status_changed`, status goes queued → processing → succeeded.
3. Log in as admin, POST a note. Check jobs: one row `admin_note_created`. After worker runs, check notifications: one row for ticket owner.
4. As admin: GET /api/admin/jobs?status=dead and GET /api/admin/notifications → 200 and JSON. As user: same URLs → 403.
5. (Optional) Make a handler throw; confirm job retries then becomes dead; GET /api/admin/jobs?status=dead shows it.

---

## Integration tests to add

1. Admin jobs: login as admin, GET /api/admin/jobs → 200 and array; login as user, GET /api/admin/jobs → 403.
2. Admin notifications: login as admin, GET /api/admin/notifications and GET /api/admin/notifications?user_id=X → 200; login as user → 403.
3. Enqueue on status change: admin PATCH ticket status; assert one job row with type `ticket_status_changed`.
4. Enqueue on note: admin POST note; assert one job row with type `admin_note_created`.
5. (Optional) Worker test: start worker, enqueue job, wait, assert job succeeded and one notification row.

---

## Pitfalls to avoid

- **SQLite:** One write at a time. Keep worker DB work short; do not run the handler inside a transaction.
- **Claiming:** Use one transaction to SELECT and UPDATE the job (or one UPDATE with subquery); avoid SELECT then UPDATE in two steps.
- **Tests:** Do not start worker when NODE_ENV=test (start only in server.js when not test). Use loginAsAdmin(agent) then agent.get('/api/admin/jobs').

---

## Acceptance checklist

- jobs and notifications tables exist; initDB creates them.
- Admin PATCH status and admin POST note each insert one job; controllers do not create notifications.
- Worker in server.js only when not test; polls every 1–2s; claims one job, runs handler, marks succeeded or failed/retry/dead.
- Handlers create notification rows (subject/message for status change and new note).
- GET /api/admin/jobs and GET /api/admin/notifications work for admin (200), 403 for user, 401 when not logged in.
- Manual run: status change and note each produce job then notification; dead jobs visible at ?status=dead.
- Integration tests for admin endpoints and enqueue on status/note (and optionally worker).

