import 'dotenv/config';
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


