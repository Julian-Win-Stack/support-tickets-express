import 'dotenv/config';
import { initDBConnection } from '../db/db.js';
import { initDB } from '../db/initDB.js';
import { getHandler } from '../lib/jobHandlers.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';       // for deleting the test database

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testDbPath = path.join(__dirname, '..', 'test.db');

if (fs.existsSync(testDbPath)) {
    try {
        fs.unlinkSync(testDbPath);
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
}

await initDBConnection();
await initDB();

const handler = getHandler('ticket_status_changed');
console.log('handler', handler);

if (handler) {
    const result = await handler({ userId: 1, ticketId: 1, oldStatus: 'open', newStatus: 'in_progress' });
    console.log('result', result);
}

