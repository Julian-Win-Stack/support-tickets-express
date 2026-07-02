# Support Ticket Express

A full-stack support ticket platform demonstrating backend architecture patterns including background jobs, audit trails, idempotent processing, and secure session management.

---

## What It Does

Support Ticket Express is a role-based customer support platform where users can submit tickets and administrators manage the ticket lifecycle.

Users can create and edit tickets, while admins can assign tickets, update statuses, add internal notes, and monitor activity through a full audit trail. The system automatically escalates overdue tickets and generates notifications through a background job pipeline.

---

## 🌐 Live Demo

https://perfect-prosperity-production-58e9.up.railway.app


https://tickets-frontend-545235255861.us-central1.run.app/ 

### Demo Accounts

**Admin**
- Email: `admina@example.com`
- Password: `demo123`

**User**
- Email: `usera@example.com`
- Password: `demo123`

---
## 🏗 Architecture Overview

```
Next.js Client
  |
  v
Express API
  |
  v
SQLite Database
  |
  v
+-----------------------+------------------------+
| Jobs Table (Queue)    | Scheduler (Escalation) |
+-----------+-----------+-----------+------------+
            |                       |
            v                       v
   Worker (Processor)        Escalation Sweep
            |
            v
      Notifications
```

The system separates:
- Request lifecycle (API)
- Background processing (worker)
- Scheduled logic (escalation sweep)


## 🧰 Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Fetch API

### Backend
- Node.js
- Express
- TypeScript
- SQLite

### Infrastructure
- Railway (deployment)
- Express-session (cookie-based auth)
- Custom DB-backed job queue

### Testing
- Vitest
- Supertest

---

## 🚀 Core Features

### 🔐 Authentication & Session Security
- Bcrypt password hashing
- Cookie-based sessions (`express-session`)
- Session ID regeneration on login (prevents fixation)
- Secure production cookie config
- Automatic 401 handling (client clears state + redirects)

---

### 👥 Role-Based Access Control

**User**
- Create tickets
- Edit own ticket title/body
- View ticket status

**Admin**
- View all tickets
- Update status
- Assign / unassign tickets
- Add internal notes (read-only ticket content)

Permissions enforced at:
- Frontend (UX)
- Backend (authoritative validation)

---

### 🎫 Ticket System
- Create / search / filter tickets
- Admin filtering:
  - `assigned_to=me`
  - `unassigned`
- Ticket detail view includes:
  - Assigned admin
  - Notes
  - Audit entries
- Automatic escalation (open > 24h)

---

### 📜 Full Audit Logging
Every critical mutation is logged:
- User register / login / logout
- Ticket create / edit / status change
- Assignment / unassignment
- Note creation
- Escalation

Includes before/after snapshots where applicable.

Filterable audit log UI:
- User filter
- Action filter
- Entity filter

---

### ⚙️ Background Job System
- Persistent DB-backed job queue
- Lifecycle: `queued → processing → succeeded → dead`
- Retry tracking
- Idempotency via `UNIQUE(job_id, user_id)` + `INSERT OR IGNORE` on notifications
- Indexed worker polling `(status, run_at)`
- Full pipeline tested (enqueue → process → notify)

---

### 🔔 Notifications
- Bell icon with unread count
- Inbox page
- Mark read / unread / mark all
- Triggered by:
  - Assignment
  - Unassignment
  - Status change
  - Escalation

---

### ⏱ Escalation Engine
- Scheduler scans for overdue tickets
- Marks escalated
- Enqueues jobs safely
- Idempotent processing
- Fully tested pipeline

---

### 🛡 Rate Limiting
Fixed-window in-memory limiter:

- Login:
  - 10/IP per 10 min
  - 5/email per 10 min
- Register:
  - 5/IP per hour
- Ticket creation:
  - 10/user per hour
  - 30/IP fallback

Includes:
- Retry hint via `retryAfterSeconds` in the 429 JSON body
- Generic login errors (no enumeration)
- Trust proxy config for correct IP detection

---

## 🧠 Technical Highlights

### Security & Hardening
- Session ID regeneration
- Secure production cookie config
- RBAC enforced server-side
- Bucket-isolated rate limiting
- Generic auth errors
- Reverse-proxy-aware IP handling

---

### Data & Structure
- Single reusable DB connection
- Clean separation of:
  - Routes
  - Services
  - Job handlers
  - Worker
  - Middleware
- Full backend migrated to TypeScript
- Schema-driven initialization + auto-seeding

---

## 🗄 Database Schema (Overview)

- **users** – authentication, roles, attribution  
- **tickets** – core entity (`status`, `assigned_admin_id`, `escalated_at`)  
- **notes** – admin-only internal notes  
- **audit_events** – structured system-wide audit trail  
- **jobs** – persistent background queue  
- **notifications** – user-facing alerts (read/unread, job-linked)

The schema separates:
- Domain state
- Collaboration
- Accountability
- Async processing
- User alerts

---

## 🧪 Testing Strategy

Integration tests cover permission boundaries, audit event creation, full job pipeline processing (enqueue → worker → notification), escalation workflow, idempotency guarantees, and rate limiting window behavior with bucket isolation and proper 429 responses.

---

## 💻 Run Locally

```bash
git clone https://github.com/Julian-Win-Stack/support-tickets-express.git
cd support-tickets-express
npm install
cd frontend && npm install && cd ..
cp .env.example .env
npm run dev

	•	Backend: http://localhost:3001
	•	Frontend: http://localhost:3000

---
