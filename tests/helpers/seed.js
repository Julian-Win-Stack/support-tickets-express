import bcrypt from 'bcrypt';
import { getDB } from '../../db/db.js';
import { SEED_PASSWORD, USERA_EMAIL, USERB_EMAIL, ADMIN_EMAIL } from './constants.js';


export async function seed() {
    const db = getDB();
    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

    await db.run(`
        INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        ['User A', USERA_EMAIL, hashedPassword, 'user'],
    );

    await db.run(`
        INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        ['User B', USERB_EMAIL, hashedPassword, 'user'],
    );

    await db.run(`
        INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        ['Admin', ADMIN_EMAIL, hashedPassword, 'admin'],
    );

    const userAId = await db.get(`SELECT id FROM users WHERE email = ?`, [USERA_EMAIL]);

    await db.run(`
        INSERT INTO tickets (user_id, title, body, status) VALUES (?, ?, ?, ?)`,
        [userAId.id, 'Ticket 1', 'Ticket 1 body', 'open'],
    );

    const ticketId = await db.get(`SELECT id FROM tickets WHERE user_id = ?`, [userAId.id]);

    const adminId = await db.get(`SELECT id FROM users WHERE email = ?`, [ADMIN_EMAIL]);
    await db.run(`
        INSERT INTO notes (ticket_id, admin_id, body) VALUES (?, ?, ?)`,
        [ticketId.id, adminId.id, 'Note 1'],
    );

    return { ticketId: ticketId.id};
}



