import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDB } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY
);
`;

/**
 * Run all pending migrations in db/migrations/ (sorted by filename).
 * Tracks applied migrations in _migrations so each migration runs only once.
 */
export async function runMigrations(): Promise<void> {
    const db = getDB();
    await db.exec(MIGRATIONS_TABLE);

    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) return;

    const applied = await db.all<{ name: string }>('SELECT name FROM _migrations');
    const appliedSet = new Set(applied.map((r) => r.name));

    const files = fs.readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();

    for (const file of files) {
        if (appliedSet.has(file)) continue;
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        await db.exec(sql);
        await db.run('INSERT INTO _migrations (name) VALUES (?)', file);
    }
}
