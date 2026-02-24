import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'node:path';
import type { Database } from 'sqlite';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: Database | null = null;

function getDbPath(): string {
    if (process.env.NODE_ENV === 'test') return path.join(__dirname, '..', 'test.db');
    if (process.env.NODE_ENV === 'production') return '/tmp/app.db';
    return path.join(__dirname, '..', 'app.db');
}

export async function initDBConnection(): Promise<Database>{
    if (db) return db;
    const dbpath = getDbPath();
    db = await open({               
        filename: dbpath,
        driver: sqlite3.Database,
    });
    return db;
}

export function getDB(): Database{
    if (!db) throw new Error('DB not initialized. Please call initDBConnection() first.');
    return db;
}

export async function getDBConnection(): Promise<Database> {
    const dbpath = getDbPath();
    return open({
        filename: dbpath,
        driver: sqlite3.Database,
    });
    
}