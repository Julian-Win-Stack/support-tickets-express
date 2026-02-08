import { getDB } from '../db/db.js';


/**
 * Insert one notification (e.g. "mock email" for a user).
 * @param {{ userId: number, channel: string, subject: string, message: string, status?: string }} opts
 * @returns {Promise<number>} The new notification's id
 */
export async function sendNotification(userId, channel, subject, message, status = 'pending') {
    const db = getDB();
    const result = await db.run(`
        INSERT INTO notifications (user_id, channel, subject, message, status)
        VALUES (?, ?, ?, ?, ?)
        `, [userId, channel, subject, message, status]);
    return result.lastID;
}


/**
 * List notifications for one user, newest first. Optional limit (default 50).
 * @param {number} userId
 * @param {number} [limit]
 * @returns {Promise<Array>}
 */
export async function getNotificationsByUser(userId, limit = 50) {
    const db = getDB();
    const rows = await db.all(`
        SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
        `, [userId, limit]);
    return rows;
}


/**
 * List the latest notifications across all users (for admin "latest 50").
 * @param {number} [limit]
 * @returns {Promise<Array>}
 */
export async function listLatestNotifications(limit = 50) {
    const db = getDB();
    const rows = await db.all(`
        SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?
        `, [limit]);
    return rows;
}

