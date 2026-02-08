

---

## Implementation steps (in order)

### Step 3 — lib/jobHandlers.js

- Export a **map**: job `type` string → async handler function.
- Implement only **one** handler: `ticket_status_changed`.
  - Input: `payload` with `userId` (ticket owner), `ticketId`, `oldStatus`, `newStatus` (or whatever you pass from the controller).
  - Handler calls `notificationsDb.createNotification({ userId: payload.userId, channel: 'email', subject: '...', message: '...' })` (e.g. "Your ticket #X status changed from A to B").
- Export a helper like `getHandler(type)` that returns the handler for that type, or `undefined` if unknown.

### Step 4 — lib/worker.js

- **startWorker(pollIntervalMs):** set an interval that, every N ms, calls `claimNextRunnable()`. If it returns a job: parse `payload_json`, get the handler for `job.type` from jobHandlers, run the handler(payload), then call `markSucceeded(job.id)`. On handler error: call `markFailed(job.id, err.message, { requeue: true })`. If no job, do nothing.
- **stopWorker():** clear the interval (for tests).
- Do **not** start the worker when `NODE_ENV === 'test'`.

### Step 5 — middleware/requireAdmin.js

- After the user is authenticated (e.g. `authUser` has run): load the user's role from the DB. If role is not `'admin'`, respond with 403 and a short message. Otherwise call `next()`.

### Step 6 — controllers/adminController.js

- **listJobs(req, res):** read `req.query.status` (default `'dead'`). Call `jobsDb.listJobs(status)` (or your actual function name). Send the result as JSON.
- **listNotifications(req, res):** if `req.query.user_id` is set, call `notificationsDb.listByUser(userId, 50)`; otherwise call `notificationsDb.listLatest(50)`. Send the result as JSON.

### Step 7 — routes/adminRouter.js

- GET `/jobs` → `adminController.listJobs`.
- GET `/notifications` → `adminController.listNotifications`.
- Attach **authUser** and **requireAdmin** to this router (so only admins can call these).

### Step 8 — app.js

- Mount the admin router under `/api/admin` with **authUser** and **requireAdmin** in the middleware chain (e.g. `app.use('/api/admin', authUser, requireAdmin, adminRouter)`).

### Step 9 — server.js

- After `app.listen(...)`, if `process.env.NODE_ENV !== 'test'`, call `startWorker(1500)` (or 1000–2000 ms).

### Step 10 — controllers/ticketController.js (enqueue only for ticket status change)

- In the block where the **admin** updates the ticket **status** (after you update the ticket and write the audit_events row):
  - Get the **ticket owner's user id** (e.g. from the ticket row you already loaded, or `SELECT user_id FROM tickets WHERE id = ?`).
  - Call **enqueue** (or your actual name, e.g. `enqueueJob`) with:
    - type: `'ticket_status_changed'`
    - payload: `{ ticketId, userId: <owner_user_id>, oldStatus, newStatus }`
  - Then return the normal JSON response.
- Do **not** add any enqueue call for admin note creation; no `admin_note_created` job.

---

## What you are not doing in this plan

- No job for **admin_note_created** (no enqueue in notesController, no handler for it in jobHandlers).
- No changes to note creation flow beyond what you already have.

---

## Quick checks

- Admin changes a ticket status → one row in `jobs` with type `ticket_status_changed` and payload containing owner `userId`.
- Worker runs → job moves to `succeeded` and one row appears in `notifications` for that owner.
- GET `/api/admin/jobs` and GET `/api/admin/notifications` return data for an admin and 403 for a non-admin.
