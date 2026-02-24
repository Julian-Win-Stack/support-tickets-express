Support Ticket Express

A full-stack support ticket platform demonstrating backend architecture patterns including background jobs, audit trails, idempotent processing, and secure session management.

⸻

🌐 Live Demo

Frontend
https://perfect-prosperity-production-58e9.up.railway.app

Backend API
https://support-tickets-express-production.up.railway.app

Demo Accounts

Admin
	•	Email: admina@example.com
	•	Password: demo123

User
	•	Email: usera@example.com
	•	Password: demo123

⸻

🏗 Architecture Overview

Next.js Client
        ↓
Express API
        ↓
SQLite Database
        ↓
Jobs Table (Queue)     Scheduler (Escalation)
        ↓                        ↓
Worker (Processor)      Escalation Sweep
        ↓
Notifications

The system separates:
	•	Request lifecycle (API)
	•	Background processing (worker)
	•	Scheduled logic (escalation sweep)

⸻

🧰 Tech Stack

Frontend
	•	Next.js
	•	TypeScript
	•	Fetch API

Backend
	•	Node.js
	•	Express
	•	TypeScript
	•	SQLite

Infrastructure
	•	Railway (deployment)
	•	Express-session (cookie-based auth)
	•	Custom DB-backed job queue

Testing
	•	Vitest
	•	Supertest

  ⸻

🚀 Core Features

🔐 Authentication & Session Security
	•	Bcrypt password hashing
	•	Cookie-based sessions (express-session)
	•	Session ID regeneration on login (prevents fixation)
	•	Secure production cookie config
	•	Automatic 401 handling (client clears state + redirects)

⸻

👥 Role-Based Access Control

User
	•	Create tickets
	•	Edit own ticket title/body
	•	View ticket status

Admin
	•	View all tickets
	•	Update status
	•	Assign / unassign tickets
	•	Add internal notes (read-only ticket content)

Permissions enforced at both:
	•	Frontend (UX)
	•	Backend (authoritative validation)

⸻

🎫 Ticket System
	•	Create / search / filter tickets
	•	Admin filtering:
	•	assigned_to=me
	•	unassigned
	•	Ticket detail view includes:
	•	Assigned admin
	•	Notes
	•	Audit entries
	•	Automatic escalation (open > 24h)

⸻

📜 Full Audit Logging

Every critical mutation is logged:
	•	User register / login / logout
	•	Ticket create / edit / status change
	•	Assignment / unassignment
	•	Note creation
	•	Escalation

Includes before/after snapshots where applicable.

Filterable audit log UI:
	•	User filter
	•	Action filter
	•	Entity filter

⸻

⚙️ Background Job System
	•	Persistent DB-backed job queue
	•	Lifecycle: queued → processing → succeeded → dead
	•	Retry tracking
	•	Idempotency via dedupe_key
	•	Indexed worker polling (status, run_at)
	•	Full pipeline tested (enqueue → process → notify)

⸻

🔔 Notifications
	•	Bell icon with unread count
	•	Inbox page
	•	Mark read / unread / mark all
	•	Triggered by:
	•	Assignment
	•	Unassignment
	•	Status change
	•	Escalation

⸻

⏱ Escalation Engine
	•	Scheduler scans for overdue tickets
	•	Marks escalated
	•	Enqueues jobs safely
	•	Idempotent processing
	•	Fully tested pipeline

⸻

🛡 Rate Limiting

Fixed-window in-memory limiter:
	•	Login:
	•	10/IP per 10 min
	•	5/email per 10 min
	•	Register:
	•	5/IP per hour
	•	Ticket creation:
	•	10/user per hour
	•	30/IP fallback

Includes:
	•	Retry-After support
	•	Generic login errors (no enumeration)
	•	Trust proxy config for correct IP detection

⸻

🧠 Technical Highlights

Engineering Decisions
	•	Database-backed job queue instead of in-memory
	•	Idempotent job processing using dedupe_key
	•	Non-atomic status updates by design
(Ticket update proceeds even if audit/job fails to preserve UX)
	•	Indexed job polling for efficient worker scans
	•	Idempotent escalation sweep

⸻

Security & Hardening
	•	Session ID regeneration
	•	Secure production cookie config
	•	RBAC enforced server-side
	•	Bucket-isolated rate limiting
	•	Generic auth errors
	•	Reverse-proxy-aware IP handling

⸻

Data & Structure
	•	Single reusable DB connection
	•	Clean separation:
	•	Routes
	•	Services
	•	Job handlers
	•	Worker
	•	Middleware
	•	Full backend migrated to TypeScript
	•	Schema-driven initialization + auto-seeding

⸻

🗄 Database Schema (Overview)

users – authentication, roles, attribution
tickets – core entity (status, assigned_admin_id, escalated_at)
notes – admin-only internal notes
audit_events – structured system-wide audit trail
jobs – persistent background queue
notifications – user-facing alerts (read/unread, job-linked)

The schema separates:
	•	Domain state
	•	Collaboration
	•	Accountability
	•	Async processing
	•	User alerts

⸻

🧪 Testing Strategy

Integration tests cover permission boundaries, audit event creation, full job pipeline processing (enqueue → worker → notification), escalation workflow, idempotency guarantees, and rate limiting window behavior with bucket isolation and proper 429 responses.

⸻

🎯 What This Project Demonstrates
	•	Building backend systems with real production concerns
	•	Designing for idempotency and retry safety
	•	Separation of concerns (API vs worker vs scheduler)
	•	Role-based access control
	•	Structured audit logging
	•	Resilient job pipelines

This project was intentionally built to practice production-style backend engineering, not just CRUD development.

⸻

Why I Built This

I built this project to deliberately practice production-style backend engineering-including idempotent job processing, structured audit logging, RBAC enforcement, escalation workflows, and rate limiting-rather than just implementing CRUD features.

The goal was to simulate real-world system design tradeoffs and failure handling in a contained environment.

⸻

💻 Run Locally

git clone https://github.com/Julian-Win-Stack/support-tickets-express.git
cd support-tickets-express
npm install
cd frontend && npm install && cd ..
cp .env.example .env
npm run dev

	•	Backend: http://localhost:3001
	•	Frontend: http://localhost:3000

⸻
