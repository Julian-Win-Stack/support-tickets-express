# Support Tickets App (Express + SQLite)

A full-stack support ticket system built with **Node.js, Express, SQLite, and vanilla JavaScript**, featuring role-based permissions, session authentication, and admin-only internal notes.

This project focuses on **backend correctness, permissions, and real-world CRUD flows**, rather than UI frameworks.

---

## Features

### Authentication & Sessions
- User registration and login
- Cookie-based sessions using `express-session`
- Persistent login state
- Logout support

### Roles & Permissions
- **User**
  - Create tickets
  - Edit their own ticket title/body
  - View ticket status
- **Admin**
  - Update ticket status (open / in_progress / resolved)
  - View all tickets
  - Add **internal admin-only notes**
  - Read-only view of ticket title/body

> Permissions are enforced **both on the frontend (UX)** and **on the backend (security)**.

---

## Ticket System
- Create support tickets
- Filter tickets by status
- Search tickets by title/body
- View ticket details
- Update tickets with strict role validation

---

## Internal Notes (Admin Only)
- Admins can add internal notes to a selected ticket
- Notes are linked to:
  - Ticket ID
  - Admin ID
- Notes are fetched and rendered dynamically per ticket

---

## Tech Stack

**Backend**
- Node.js
- Express
- SQLite
- express-session

**Frontend**
- Vanilla JavaScript (no framework)
- HTML / CSS
- Fetch API

**Database**
- SQLite with relational schema
- Foreign key constraints
- Cascading deletes

---

## Database Schema (Simplified)

- users
- tickets
- notes

Relationships:
- tickets.user_id → users.id
- notes.ticket_id → tickets.id
- notes.admin_id → users.id

---

## UX States

- Logged out → authentication only
- Logged in as user → ticket creation & editing
- Logged in as admin → ticket moderation & internal notes

UI is dynamically controlled based on session + role.

---

## Project Goals

This project was built to:
- Practice **real backend permissions**
- Build a **complete CRUD system**
- Understand **session-based auth**
- Simulate how internal admin tools work in startups

---

## Not Included (By Design)

- React / Next.js
- ORMs
- CSS frameworks
- Third-party auth providers

The goal was to master fundamentals before moving to higher-level abstractions.

---

## Next Steps (Planned)
- Rebuild frontend using React + TypeScript
- API reuse with Next.js
- Improve UI state handling
- Add audit logs and structured errors

---

## How to Run Locally

```bash
npm install
npm run dev
