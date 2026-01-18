import express from "express";
import path from "path";
import session from "express-session";
import "dotenv/config";
import { fileURLToPath } from "url";
import { initDB } from './db/initDB.js';
import { authRouter } from './routes/authRouter.js'

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await initDB();

app.use(express.json());

app.use(
  session({
    name: "sid",                 // cookie name (can be anything)
    secret: process.env.SESSION_SECRET,    // replace with env var later
    resave: false,               // don't save session if unchanged
    saveUninitialized: false,    // don't create session until needed
    cookie: {
      httpOnly: true,            // JS cannot access cookie
      sameSite: "lax",           // protects against CSRF (basic)
      secure: false,             // true ONLY when using HTTPS
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
})

app.get('/api/health', (req,res)=>{
  res.json({ok: true});
})

app.use('/api/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
})
