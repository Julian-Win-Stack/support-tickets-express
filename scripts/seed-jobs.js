/**
 * Insert mock data into the jobs table.
 * Run: node scripts/seed-jobs.js   (uses app.db)
 * Or:   NODE_ENV=test node scripts/seed-jobs.js   (uses test.db)
 */
import 'dotenv/config';
import { initDBConnection } from '../db/db.js';
import { initDB } from '../db/initDB.js';
import { getDB } from '../db/db.js';

await initDBConnection();
await initDB();

const db = getDB();
const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

await db.run(
    `INSERT INTO jobs (type, payload_json, status, attempts, max_attempts, run_at, last_error, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
        'ticket_status_changed',
        JSON.stringify({ userId: 1, ticketId: 10, oldStatus: 'open', newStatus: 'in_progress' }),
        'queued',
        0,
        3,
        now,
        null,
        now,
    ]
);
await db.run(
    `INSERT INTO jobs (type, payload_json, status, attempts, max_attempts, run_at, last_error, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
        'ticket_status_changed',
        JSON.stringify({ userId: 2, ticketId: 11, oldStatus: 'in_progress', newStatus: 'resolved' }),
        'succeeded',
        1,
        3,
        now,
        null,
        now,
    ]
);
await db.run(
    `INSERT INTO jobs (type, payload_json, status, attempts, max_attempts, run_at, last_error, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
        'ticket_status_changed',
        JSON.stringify({ userId: 1, ticketId: 12, oldStatus: 'open', newStatus: 'resolved' }),
        'dead',
        3,
        3,
        now,
        'Handler threw after max retries',
        now,
    ]
);

console.log('Mock jobs inserted (3 rows: 1 queued, 1 succeeded, 1 dead).');
