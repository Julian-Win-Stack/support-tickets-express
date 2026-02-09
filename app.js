import express from "express";
import path from "path";
import session from "express-session";
import "dotenv/config";
import { fileURLToPath } from "url";
import { initDB } from './db/initDB.js';
import { authRouter } from './routes/authRouter.js';
import { ticketRouter } from './routes/ticketRouter.js';
import { notesRouter } from './routes/notesRouter.js';
import { initDBConnection } from './db/db.js';
import { adminRouter } from './routes/adminRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// #region agent log

fetch('http://127.0.0.1:7242/ingest/27fe6fd2-65e8-45af-943a-8f4a6a7bfe17',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:beforeInitDB',message:'app.js loading, about to initDB',data:{NODE_ENV:process.env.NODE_ENV},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
// #endregion
await initDBConnection();
await initDB();

const app = express();

app.use(express.json());

app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/ticket', ticketRouter);
app.use('/api/notes', notesRouter);
app.use('/api/admin', adminRouter);

export { app };
