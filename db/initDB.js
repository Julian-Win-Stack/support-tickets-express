import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from "node:fs";
import { getDBConnection } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDB() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/27fe6fd2-65e8-45af-943a-8f4a6a7bfe17',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'db/initDB.js:initDB',message:'initDB entered',data:{NODE_ENV:process.env.NODE_ENV},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    const db = await getDBConnection();
    const direction = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(direction, 'utf-8');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/27fe6fd2-65e8-45af-943a-8f4a6a7bfe17',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'db/initDB.js:beforeExec',message:'before exec schema',data:{schemaPath:direction},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion

    await db.exec(schema);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/27fe6fd2-65e8-45af-943a-8f4a6a7bfe17',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'db/initDB.js:afterExec',message:'schema exec done',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    await db.close();
    
}