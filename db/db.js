import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null

export async function initDBConnection(){
    if (db) return db;
    const dbpath = process.env.NODE_ENV === 'test' 
        ? path.join(__dirname, '..', 'test.db') 
        : path.join(__dirname, '..', 'app.db');
    db = await open({               
        filename: dbpath,
        driver: sqlite3.Database,
    });
    return db;
}

export function getDB(){
    if (!db) throw new Error('DB not initialized. Please call initDBConnection() first.');
    return db;
}

export async function getDBConnection() {
    const dbpath = process.env.NODE_ENV === 'test' ? 
    path.join(__dirname, '..', 'test.db') 
    : path.join(__dirname, '..', 'app.db');
    return open({
        filename: dbpath,
        driver: sqlite3.Database,
    });
    
}