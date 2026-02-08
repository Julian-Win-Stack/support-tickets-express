import 'dotenv/config';
import { initDBConnection } from '../db/db.js';
import { initDB } from '../db/initDB.js';
import { sendNotification, getNotificationsByUser, listLatestNotifications } from '../lib/notificationsDb.js';
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

const test1 = await sendNotification(1, 'email', 'Test Notification', 'This is a test notification', 'pending');
console.log('test1', test1);

const test2 = await getNotificationsByUser(1);
console.log('test2', test2);

const test3 = await listLatestNotifications();
console.log('test3', test3);