import 'dotenv/config';
import { initDBConnection } from '../db/db.js';
import { initDB } from '../db/initDB.js';
import { enqueueJob, claimNextRunnable, markSucceed, markFailed, listJobs } from '../lib/jobsDb.js';
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

const test1 = await enqueueJob('test', { message: 'Hello, world!' });
console.log('test1', test1);

const test2 = await claimNextRunnable();
console.log('test2', test2);

await markSucceed(test1);


const test4 = await markFailed(test1, 'Test failed', { requeue: true });
console.log('test4', test4);

const test5 = await listJobs('queued');
console.log('test5', test5);

