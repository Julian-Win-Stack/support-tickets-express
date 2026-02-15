import bcrypt from 'bcrypt';
import { getDB } from '../../db/db.js';
import { SEED_PASSWORD, USERA_EMAIL, USERB_EMAIL, ADMIN_EMAIL, ADMINB_EMAIL } from './constants.js';


export async function seed() {
    const db = getDB();
    await db.run(`DELETE FROM tickets`);
    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

    await db.run(`
        INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        ['User A', USERA_EMAIL, hashedPassword, 'user'],
    );
    await db.run(`
        INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        ['User B', USERB_EMAIL, hashedPassword, 'user'],
    );
    await db.run(`
        INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        ['Admin', ADMIN_EMAIL, hashedPassword, 'admin'],
    );
    await db.run(`
        INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        ['Admin B', ADMINB_EMAIL, hashedPassword, 'admin'],
    );

    const userAId = await db.get(`SELECT id FROM users WHERE email = ?`, [USERA_EMAIL]);
    const userBId = await db.get(`SELECT id FROM users WHERE email = ?`, [USERB_EMAIL]);
    const adminId = await db.get(`SELECT id FROM users WHERE email = ?`, [ADMIN_EMAIL]);
    const adminBId = await db.get(`SELECT id FROM users WHERE email = ?`, [ADMINB_EMAIL]);
    await db.run(`
        INSERT INTO tickets (user_id, title, body, status) VALUES (?, ?, ?, ?)`,
        [userAId.id, 'Ticket 1', 'Ticket 1 body', 'open'],
    );

    await db.run(`
        INSERT INTO tickets (user_id, title, body, status, created_at) VALUES (?, ?, ?, ?, datetime('now', '-25 hours'))`,
        [userAId.id, 'Ticket escalate', 'Ticket escalate body', 'open'],
    );

    await db.run(`
        INSERT INTO tickets (user_id, title, body, status) VALUES (?, ?, ?, ?)`,
        [userBId.id, 'Ticket 2B', 'Ticket 2B body', 'open'],
    );
    await db.run(`
        INSERT INTO tickets (user_id, title, body, status) VALUES (?, ?, ?, ?)`,
        [adminId.id, 'Ticket 3', 'Ticket 3 body', 'open'],
    );

    const ticketId = await db.get(`SELECT id FROM tickets WHERE user_id = ?`, [userAId.id]);
    const ticketBId = await db.get(`SELECT id FROM tickets WHERE user_id = ?`, [userBId.id]);
    const ticketAdminId = await db.get(`SELECT id FROM tickets WHERE user_id = ?`, [adminId.id]);
    const ticketEscalateId = await db.get(`SELECT id FROM tickets WHERE title = ?`, ['Ticket escalate']);
    await db.run(`
        INSERT INTO notes (ticket_id, admin_id, body) VALUES (?, ?, ?)`,
        [ticketId.id, adminId.id, 'Note 1'],
    );

    return { ticketId: ticketId.id,
         adminId: adminId.id, 
         adminBId: adminBId.id, 
         userAId: userAId.id, 
         userBId: userBId.id, 
         ticketBId: ticketBId.id, 
         ticketAdminId: ticketAdminId.id,
         ticketEscalateId: ticketEscalateId.id };
}



