import { getDBConnection } from "./db/db.js";
const tableName = 'notes';

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