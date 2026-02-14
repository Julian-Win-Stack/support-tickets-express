import 'dotenv/config';
import Table from 'cli-table3';
import { getDBConnection } from "./db/db.js";
const tableName = 'notifications';

// Uses test.db when NODE_ENV=test, otherwise app.db. To see jobs from test-jobsDb script, run: NODE_ENV=test npx tsx logTable.ts
async function logTable() {
    const db = await getDBConnection();
    try {
        const table = await db.all(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
        if (table.length === 0) {
            console.log(`No rows in ${tableName}`);
            return;
        }
        const cols = Object.keys(table[0] as Record<string, unknown>);
        const t = new Table({ head: cols });
        table.forEach((row) => t.push(cols.map((c) => String((row as Record<string, unknown>)[c] ?? ''))));
        console.log(t.toString());
    } catch (err) {
        console.error('Error logging table', err);
    }
}
logTable();