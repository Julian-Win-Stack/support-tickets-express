import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from "node:fs";
import { getDBConnection } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDB() {
    const db = await getDBConnection();
    const direction = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(direction, 'utf-8');

    await db.exec(schema);
    await db.close();
    
}