import bcrypt from 'bcrypt';
import { initDBConnection } from '../db/db.js';
import { initDB } from '../db/initDB.js';

try {
    await initDBConnection();
    await initDB();

    const password = 'adminjulian';
    const hashedPassword = await bcrypt.hash(password, 10);

    const db = await initDBConnection();
    await db.run(
        `INSERT OR IGNORE INTO users (name, email, password_hash, role)
         VALUES (?, ?, ?, ?)`,
        ['Admin Julian', 'admin.julian@gmail.com', hashedPassword, 'admin']
    );

} catch (error) {
    console.error(error);
} finally {
    process.exit(0);
}



