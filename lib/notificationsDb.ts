import { getDB } from '../db/db.js';
import type { Notifications } from '../db/types.js';


/**
 * Insert one notification (e.g. "mock email" for a user).
 */
export async function sendNotification(userId: number, channel: string, subject: string, message: string, status: string = 'pending'): Promise<number> {
    const db = getDB();
    const result = await db.run(`
        INSERT INTO notifications (user_id, channel, subject, message, status)
        VALUES (?, ?, ?, ?, ?)
        `, [userId, channel, subject, message, status]);

    if (result.lastID) return result.lastID;
    throw new Error('Failed to insert notification');
}


/**
 * List notifications for one user, newest first. Optional limit (default 50).
 */
export async function getNotificationsByUser(userId: number, limit = 50): Promise<Notifications[]> {
    const db = getDB();
    const rows = await db.all(`
        SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
        `, [userId, limit]);
    return rows;
}


/**
 * List the latest notifications across all users (for admin "latest 50").
 */
export async function listLatestNotifications(limit = 50): Promise<Notifications[]> {
    const db = getDB();
    const rows = await db.all(`
        SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?
        `, [limit]);
    return rows;
}

