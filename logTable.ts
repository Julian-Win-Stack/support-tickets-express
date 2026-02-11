import 'dotenv/config';
import { getDBConnection } from "./db/db.js";
const tableName = 'notifications';

// Uses test.db when NODE_ENV=test, otherwise app.db. To see jobs from test-jobsDb script, run: NODE_ENV=test node logTable.js
async function logTable() {
    const db = await getDBConnection();
    try{
        const table = await db.all(`SELECT * FROM ${tableName}`);
        console.table(table);

    }catch(err){
        console.error('Error logging table', err);
    }
}
logTable();