import { getDB } from '../db/db.js';
import type { Notifications } from '../db/types.js';


/**
 * Insert one notification (e.g. "mock email" for a user).
 * ticketId is optional; when provided, links the notification to a ticket for "Open ticket" UI.
 */
export async function sendNotification(userId: number, channel: string, subject: string, message: string, status: string = 'pending', jobId: number, ticketId?: number): Promise<void> {
    try{
    const db = getDB();
    await db.run(`
        INSERT OR IGNORE INTO notifications (user_id, channel, subject, message, status, job_id, ticket_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [userId, channel, subject, message, status, jobId, ticketId ?? null]);
        return
    }catch (error){
        console.error('Failed to insert notification', error);
        throw new Error('Failed to insert notification');
    }
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

